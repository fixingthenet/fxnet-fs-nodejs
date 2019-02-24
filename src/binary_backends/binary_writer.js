const stream = require('stream');
const crypto = require('crypto')
var mmm = require('mmmagic'),
    Magic = mmm.Magic;

var magic = new Magic(mmm.MAGIC_MIME_TYPE |
                      mmm.MAGIC_MIME_ENCODING);

const MAX_BYTES=10000;

class BinaryStoreWriteStream extends stream.Writable {
    constructor(storagePath) {
        super({emitClose: true});
        this.storagePath=storagePath
        this.bytes_written=0
        this.firstBytes = new Buffer.alloc(MAX_BYTES*2)

        this.shasum = crypto.createHash('sha512');
        this.storageKey='';
    }

    _write(chunk, enc, next) {
        if (this.bytes_written < MAX_BYTES) {
            this.firstBytes.write(chunk.toString('ascii'))
            console.log("Wrote firstBytes", this.firstBytes.length)

        }

        console.log("RECEIVED:",chunk.length)//,chunk.toString('ascii'));
        this.shasum.update(chunk.toString('ascii'));
        this.bytes_written =  this.bytes_written + chunk.length
        next();
    }

    contentType() {
        return new Promise( (resolve, reject) => {
            magic.detect(this.firstBytes, function(err, result) {
                if (err) reject(err);
                resolve(result)
            });
        })
    }

    etag() {
        return this.shasum.digest('hex');
    }
}

module.exports = BinaryStoreWriteStream;
