const iNode = require("jsDAV/lib/DAV/interfaces/iNode");
const StoragePath = require("../../lib/storage_path")

var FSNode = iNode.extend({
    initialize(storagePath) {
        this.storagePath=storagePath
    },


    //TBD:
    //setName
    //exists


    exists(cb) {
        console.log("exists",this.storagePath.path)
    },


    async "delete"(cb) {
        console.log("delete",this.storagePath.path)
        await this.storagePath.remove();
        cb(null,null)

    },

    getName() {
        console.log("getName",this.storagePath.path)
        return this.storagePath.name
    },

    getLastModified(cb) {
        console.log("getLastModified",this.storagePath.path)
        this.storagePath.entry().then(entry => {
            console.log(entry.modified_at)
            cb(null,entry.modified_at)
        })
    }

})


module.exports = FSNode;
