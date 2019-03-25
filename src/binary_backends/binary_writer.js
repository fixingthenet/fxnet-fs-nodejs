const util = require('util');
const fs = require('fs');
const fsp = require('fs').promises;

const stream = require('stream');
const crypto = require('crypto')
var mmm = require('mmmagic'),
    Magic = mmm.Magic;

var magic = new Magic(mmm.MAGIC_MIME_TYPE |
                      mmm.MAGIC_MIME_ENCODING);

const MAX_BYTES=10000;
const contentTypeRegexp =/(.*?)\/(.*?); charset=(.*)/

class BinaryStoreWriteStream extends stream.Writable {
    constructor(storagePath, basePath) {
        super({emitClose: true});
        this.basePath=basePath;
        this.storagePath=storagePath
        this.firstBytes = new Buffer.alloc(MAX_BYTES*2)
        this.shasum = crypto.createHash('sha512');

        this.etag=null;
        this.contentType = '';
        this.bytes_written=0;
    }

    async init() {
        await this._storageKey()
        this.fd=await fsp.open(this.basePath+this.storageKey,'w')
    }

    async _write(chunk, enc, next) {
        if (this.bytes_written < MAX_BYTES) {
            this.firstBytes.write(chunk.toString('ascii'))
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
        await this.storagePath.updateMetaContent({
            storage_key: this.storageKey,
            sha512: this.etag,
            content_size: this.bytes_written,
            content_type_major: this.contentTypeMajor,
            content_type_minor: this.contentTypeMinor,
            content_type_charset: this.charset
        })
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


            var entry = await this.storagePath.entry();
            var path = crypto.
                createHash('md5').
                update(entry.id).
                digest('hex').
                match(/(.{3})(.{3})(.{3})(.*)/).
                slice(1,5);

            var dir = this.basePath+path.slice(0,3).join('/');

            this.storageKey=path.join('/')+'-'+entry.id;
            console.log("creating dir", path, dir, this.storageKey)

            fs.access(dir, (err) => {
                if (err) {
                    console.log("creating dir", dir)
                    fs.mkdir(dir, { recursive: true }, (err) => {
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

module.exports = BinaryStoreWriteStream;
