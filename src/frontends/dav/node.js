const iNode = require("jsDAV/lib/DAV/interfaces/iNode");
const StoragePath = require("../../lib/storage_path")

var FSNode = iNode.extend({
    initialize(storagePath) {
        this.storagePath=storagePath
    },


    //TBD:
    //delete
    //setName
    //exists
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
