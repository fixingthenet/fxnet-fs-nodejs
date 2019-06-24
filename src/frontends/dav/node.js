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
        if (cb) {
            cb(null,null)
        }
    },

    getName() {
        console.log("getName",this.storagePath.path)
        return this.storagePath.name
    },

    async getLastModified(cb) {
        console.log("getLastModified",this.storagePath.path)
        var entry=await this.storagePath.entry()
        console.log(entry.modified_at)
        if (cb) {
            cb(null,entry.modified_at)
        } else {
            return entry.modified_at
        }
    },

    basePath() {
        return this.storagePath.tree.basePath
    },

    async moveToParent(newParent, newName) {
        await this.storagePath.move(newParent.storagePath,
                                    newName)
    }
})


module.exports = FSNode;
