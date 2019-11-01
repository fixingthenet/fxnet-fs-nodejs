const iCollection = require("jsDAV/lib/DAV/interfaces/iCollection");
const iQuota = require("jsDAV/lib/DAV/interfaces/iQuota");
const iExtendedCollection = require("jsDAV/lib/DAV/interfaces/iExtendedCollection");
var Exc = require("jsDAV/lib/shared/exceptions");

const FSNode = require("./node");
const FSFile = require("./file");
const async = require("async");

var FSDirectory = FSNode.extend(iCollection,
                                iQuota,
                                iExtendedCollection,
                                {

    async "delete"() {
        //var children=await this.getChildren()
        this.writeAllowed()
        await this.storagePath.remove();
    },

/*    async getChild(name) {
        this.readAllowed()
        var child= await this.storagePath.child(name)
        return FSDirectory.wrap(child, this.tree)
    },*/

    async getChildren() {
        this.readAllowed()
        var children = await this.storagePath.children()
        return children.map( (child) => {return FSDirectory.wrap(child, this.tree)})
    },

    async getQuotaInfo() {
        return Promise.resolve([400,8000000000])
    },

    async createDirectory(newName, resourceType, properties) {
         this.writeAllowed()
         console.log("createextendedcollection",newName,
                     resourceType, properties)
         var child = await this.storagePath.createChild(newName,true)
         if (child) {
             return FSDirectory.wrap(child, this.tree)
         } else {
//             console.log("Conflict", newName)
             throw(new Exc.MethodNotAllowed(newName))
         }
     },


     async createFile(name) {
       this.writeAllowed()
       var backend = await this.storagePath.backend()

       if (!backend.writeStream)
           throw( new Exc.Forbidden('The backend can not handle files.'))

       var childStoragePath = await this.storagePath.createChild(name, false);
         var child = FSDirectory.wrap(childStoragePath, this.tree);
       return child
     },

})

// wrap is only used by directory AND tree!
FSDirectory.wrap=function(sp, tree) {
    if (sp.isFolder()) {
        return FSDirectory.new(sp, tree)
    } else {
        return FSFile.new(sp, tree)
    }
}

module.exports = FSDirectory;
