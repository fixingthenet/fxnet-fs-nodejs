const iNode = require("jsDAV/lib/DAV/interfaces/iNode");
const StoragePath = require("../../lib/storage_path")

var FSNode = iNode.extend({
    initialize(storagePath) {
        this.storagePath=storagePath
        this.inode=storagePath.inode
    },


    //TBD:
    //setName
    //exists


    async "delete"() {
        console.log("delete",this.storagePath.path)
        await this.storagePath.remove();
    },

    getName() {
        return this.storagePath.name
    },

    getLastModified() {
        return this.inode.modified_at
    },

    basePath() {
        return this.storagePath.tree.basePath
    },

    async moveToParent(newParent, newName) {
        await this.storagePath.move(newParent.storagePath,
                                    newName)
    },

    async copyToParent(newParent, newName) {
        await this.storagePath.copy(newParent.storagePath,
                                    newName)
    }
})


module.exports = FSNode;
