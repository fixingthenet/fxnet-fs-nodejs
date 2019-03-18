const iFile = require("jsDAV/lib/DAV/interfaces/iFile");
const FSNode = require("./node");
const BinaryStoreReadStream = require('../../binary_backends/binary_reader.js')
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
        var stream = new BinaryStoreReadStream(this.storagePath,
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

    }
})


module.exports = FSFile;
