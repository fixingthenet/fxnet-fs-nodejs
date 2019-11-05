const EventEmitter = require('events');
const util = require('util');
const stream = require('stream');
const crypto = require('crypto');
const Fs = require('fs');
const Fsp = require('fs').promises;

var mmm = require('mmmagic');
var Magic = mmm.Magic;
var magic = new Magic(mmm.MAGIC_MIME_TYPE |
                      mmm.MAGIC_MIME_ENCODING);

const MAX_BYTES=20000;
const contentTypeRegexp =/(.*?)\/(.*?); charset=(.*)/


class BinaryStoreReadStream extends EventEmitter {
    constructor(backend,file,start,end) { //options: start,end
        //super({emitClose: true});
        super();
        this.backend = backend;
        this.file=file;
        this.start=start;
        this.end=end

        this.options={};
        if (typeof start == "number" && typeof end == "number")
            this.options = { start: start, end: end };
    }

    pause() {
        return this.stream.pause()
    }

    resume() {
        return this.stream.resume()
    }




    async init(){
        // storageKey!!!
        var fullPath=this.backend.config.base+this.backend.config.downPath
//        console.log("BinaryStoreReadStream: init", fullPath, this.start, this.end, this.options)
        this.stream = Fs.createReadStream(fullPath,
                                         this.options);


        this.stream.on("data", (data) => {
            this.emit("data",data)
        });

        this.stream.on("error", (err) => {
            this.emit("error",err)
        });

        this.stream.on("end", () => {
            this.emit("end")
        });
    }
}

class BinaryStoreWriteStream extends stream.Writable {
    constructor(backend,file) {
        super({emitClose: true});
        this.backend = backend;
        this.file=file
        this.firstBytes = new Buffer.alloc(MAX_BYTES*2)
        this.shasum = crypto.createHash('sha512');

        this.etag=null;
        this.contentType = '';
        this.bytes_written=0;
        this.fullPath=this.backend.config.base+this.backend.config.downPath
    }

    async init() {

//        console.log("destination:", destination);
        this.fd=await Fsp.open(this.fullPath,'w')
    }

    async _write(chunk, enc, next) {

        //we save the first bytes for analysis (mmagic)
        if (this.bytes_written < MAX_BYTES) {
            this.firstBytes.write(chunk.toString('ascii'), 'ascii')
//            console.log("Wrote firstBytes", this.firstBytes.length)

        }

        // console.log("RECEIVED:",chunk.length)//,chunk.toString('ascii'));
        this.shasum.update(chunk.toString('ascii'));
        this.bytes_written =  this.bytes_written + chunk.length
        await this.fd.write(chunk,0,chunk.length)
        next();
    }

    async closing() {
        await this.fd.close();
        this.contentType=await this._contentType();
        this.etag=this._etag();
        var cmatch=this.contentType.match(contentTypeRegexp);
        this.contentTypeMajor=cmatch[1];
        this.contentTypeMinor=cmatch[2];
        this.charset=cmatch[3];
        await this.file.storagePath.updateMetaContent({
            sha512: this.etag,
            content_size: this.bytes_written,
            content_type_major: this.contentTypeMajor,
            content_type_minor: this.contentTypeMinor,
            content_type_charset: this.charset
        })
        // and update the file
        this.file.sha512 = this.etag;
        // TBD update more
        console.log("binary:",
                    this.etag,
                    this.bytes_written,
                    this.contentType,
                    this.contentTypeMajor,
                    this.contentTypeMinor,
                    this.charset
                   );
    }

    _contentType() {
        return new Promise( (resolve, reject) => {
            magic.detect(this.firstBytes, function(err, result) {
                if (err) reject(err);
                resolve(result)
            });
        })
    }

    _etag() {
        return this.shasum.digest('hex');
    }

    calcStorageKey() {
        return this.backend.config.base + this.backend.config.downPath;
    }
}


class MirroredLocal {
    // config has:
    // base: base path
    // downPath (the path from base down the tree)
    // uid
    // gid

    constructor(config) {
        this.config=config
        this.config.fullPath=this.config.base + this.config.downPath
    }

    async readStream(file, start, end) {
        var stream =  new BinaryStoreReadStream(this, file,start,end);
        await stream.init()
        return stream;
    }

    async writeStream(file) {
        var stream =  new BinaryStoreWriteStream(this, file);
        await stream.init()
        return stream;
    }

    async mkdir(name, resourceType, properties) {
        var dir = this.config.base + this.config.downPath
        if (this.config.downPath!='') {
            dir = dir + '/'
        }
        dir = dir + name;
        console.log("MirroredLocal mkdir:",
                    this.config.base,
                    this.config.downPath,
                    name,
                    dir)
        await Fsp.mkdir(dir, { recursive: true })
        if (this.config.uid && this.config.gid) {
            await Fsp.chown(dir, this.config.uid, this.config.gid)
        }
    }

    async move(newPath) {
        var srcPath = this.config.fullPath
        var destPath = this.config.base+newPath
        console.log("MirroredLocal move:",srcPath,destPath)
        await Fsp.rename(srcPath, destPath)
    }

    async copy() {

    }

    async remove() {
        try {
            console.log("MirroredLocal: remove", this.config.fullPath)
            await Fsp.unlink(this.config.fullPath)
        } catch(e) {
            try {
                await Fsp.rmdir(this.config.fullPath)
            } catch(e) {
//                console.error("MirroredLocal: remove()", e)
            }
        }

    }

}

MirroredLocal.name='MirroredLocal'

module.exports= MirroredLocal
