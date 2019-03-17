const Fs = require('fs');
const iFile = require("jsDAV/lib/DAV/interfaces/iFile");
const FSNode = require("./node");
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
        var options;
        if (typeof start == "number" && typeof end == "number")
            options = { start: start, end: end };
        var path = await this.storagePath.storageKey();
        console.log("Gettintg stream from", path);
        var stream = Fs.createReadStream('/code/public/'+path, options);
        stream.on("data", function(data) {
            cb(null, data);
        });

        stream.on("error", function(err) {
            cb(err);
        });

        stream.on("end", function() {
            // Invoking the callback without error and data means that the callee
            // can continue handling the request.
            cb();
        });

    }
})


module.exports = FSFile;
