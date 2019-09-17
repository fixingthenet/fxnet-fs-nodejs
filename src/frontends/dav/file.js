const iFile = require("jsDAV/lib/DAV/interfaces/iFile");
const FSNode = require("./node");
const Backends = require('../../backends');


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
        var backend = Backends.get('JustMeta');
        var stream = await backend.readStream(this,start, end)
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
        var backend = Backends.get('JustMeta');
        var stream = await backend.writeStream(this);

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
