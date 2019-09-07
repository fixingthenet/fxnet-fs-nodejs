const iFile = require("jsDAV/lib/DAV/interfaces/iFile");
const FSNode = require("./node");
const BinaryStoreReadStream = require('../../binary_backends/binary_reader.js')
const BinaryStoreWriteStream = require("../../binary_backends/binary_writer");

var FSFile = FSNode.extend(iFile, {
    //put
    //get
    getETag() {
       return this.inode.sha512
    },

    getContentType() {
        return this.inode.contentType
    },

    getSize() {
        return this.inode.content_size
    },

    async getStream(start, end) {
        var stream = new BinaryStoreReadStream(this,
                                               start,
                                               end)
        await stream.init();
        return stream
    },

    async putStream() {
        console.debug("putStream", this.storagePath.path);
//        var size = handler.httpRequest.headers["x-file-size"];


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
        return stream;
    }
})


module.exports = FSFile;
