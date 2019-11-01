const iFile = require("jsDAV/lib/DAV/interfaces/iFile");
const FSNode = require("./node");

var FSFile = FSNode.extend(iFile, {
    //put
    //get

    async "delete"() {
        this.writeAllowed()
        await this.storagePath.remove();
    },


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
        this.readAllowed()
        var backend = await this.storagePath.backend()
        var stream = await backend.readStream(this,start, end)
        return stream
    },

    async putStream() {
        this.writeAllowed()
        //        console.debug("putStream", this.storagePath.path);
        var backend = await this.storagePath.backend()
        var stream = await backend.writeStream(this)

        stream.on("finish",() => {
            stream.destroy();
        })
        stream.on("close",async () => {
            await stream.closing()
//            console.log("upload done (close)")
        })
        return stream;
    }
})


module.exports = FSFile;
