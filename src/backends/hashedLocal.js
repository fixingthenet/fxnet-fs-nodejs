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
    constructor(file,start,end) { //options: start,end
        //super({emitClose: true});
        super();
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
        var path = await this.file.storagePath.storageKey();
        var fullPath = this.file.basePath()+path;
        this.stream = Fs.createReadStream(fullPath,
                                         this.options);
        console.log("BinaryStoreReadStream: init", fullPath, this.start, this.end, this.options)

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
    constructor(file) {
        super({emitClose: true});
        this.file=file
        this.firstBytes = new Buffer.alloc(MAX_BYTES*2)
        this.shasum = crypto.createHash('sha512');

        this.etag=null;
        this.contentType = '';
        this.bytes_written=0;
    }

    async init() {
        await this._storageKey()
        var destination = this.file.basePath()+this.storageKey;
        console.log("destination:", destination);
        this.fd=await Fsp.open(destination,'w')
    }

    async _write(chunk, enc, next) {

        //we save the first bytes for analysis (mmagic)
        if (this.bytes_written < MAX_BYTES) {
            this.firstBytes.write(chunk.toString('ascii'), 'ascii')
            console.log("Wrote firstBytes",
                        this.firstBytes.length)

        }

        console.log("RECEIVED:",chunk.length)//,chunk.toString('ascii'));
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
            storage_key: this.storageKey,
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
                    this.storageKey,
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

    async _storageKey() {
        return new Promise (async ( resolve, reject) => {
            if (this.storageKey) {
                resolve(this.storageKey)
            }


            var inode = await this.file.storagePath.inode;
            var path = crypto.
                createHash('md5').
                update(inode.id).
                digest('hex').
                match(/(.{3})(.{3})(.{3})(.*)/).
                slice(1,5);

            var dir = this.file.basePath()+path.slice(0,3).join('/');

            this.storageKey=path.join('/')+'-'+inode.id;
            console.log("creating dir", path, dir, this.storageKey)

            Fs.access(dir, (err) => {
                if (err) {
                    console.log("creating dir", dir)
                    Fs.mkdir(dir, { recursive: true }, (err) => {
                        console.log("created dir",err)
                        resolve(this.storageKey);
                    })
                } else {
                    resolve(this.storageKey);
                }

            })
        })
    }
}


class HashedLocal {
    constructor() {
    }

    async readStream(file, start, end) {
        var stream =  new BinaryStoreReadStream(file,start,end);
        await stream.init()
        return stream;
    }

    async writeStream(file) {
        var stream =  new BinaryStoreWriteStream(file);
        await stream.init()
        return stream;
    }
}

HashedLocal.name='HashedLocal'

module.exports= HashedLocal
