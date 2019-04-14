const iFile = require("jsDAV/lib/DAV/interfaces/iFile");
const FSNode = require("./node");
const BinaryStoreReadStream = require('../../binary_backends/binary_reader.js')
const BinaryStoreWriteStream = require("../../binary_backends/binary_writer");

var FSFile = FSNode.extend(iFile, {
    //put
    //get
    getETag(cb) {
        this.storagePath.entry().then(entry => {
            cb(null,entry.sha512)
        })
    },

    getContentType(cb) {
        this.storagePath.contentType().then(ct => {
            cb(null,ct)
        })
    },

    getSize(cb) {
        this.storagePath.entry().then(entry => {
            cb(null,entry.content_size)
        })
    },

    async getStream(start, end, cb) {
        var stream = new BinaryStoreReadStream(this,
                                               start,
                                               end)
        await stream.init();

        stream.on("data", function(data) {
            cb(null, data);
        });

        stream.on("error", function(err) {
            cb(err);
        });

        stream.on("end", function() {
            cb();
        });

    },

    async putStream(handler, enc, cb) {
        console.debug("putStream", this.storagePath.path);
        var size = handler.httpRequest.headers["x-file-size"];


//        if (size) {
            //if (!handler.httpRequest.headers["x-file-name"])
            //    handler.httpRequest.headers["x-file-name"] = name;
            //            this.writeFileChunk(handler, enc, cbfscreatefile);
//            cb(Exc.FileNotFound('ups'))
//        } else {
        var stream = new BinaryStoreWriteStream(this)
            await stream.init();
            stream.on("finish",() => {
                stream.destroy();
            })
            stream.on("close",async () => {
                stream.closing()
                console.log("upload done (close)")
            })

            handler.getRequestBody(enc, stream, true, cb);
//        }
    }
})


module.exports = FSFile;
