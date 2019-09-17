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

    //iCollection

    //createFile
    //createDirectory
    //exists
    async getChild(name) {
        var child= await this.storagePath.child(name)
        return this._wrapStoragePath(child)
    },

    async getChildren() {
        var children = await this.storagePath.children()
//        console.log("children:",children)
        return children.map(this._wrapStoragePath)
    },

    //iQuota
    async getQuotaInfo() {
        // used, available,
        return Promise.resolve([400,8000000000])
    },

// iHref
//    async getHref(cb) {
//        console.log("getHref")
//        cb(path)
//   },


     async createExtendedCollection(newName, resourceType, properties) {
         console.log("createextendedcollection",newName,
                     resourceType, properties)
         var child = await this.storagePath.createChild(newName,true)
         if (child) {
             return child
         } else {
             throw(Exc.Conflict(newName))
         }
     },


   async createFile(name) {
       console.debug("createFile",
                     this.storagePath.path,
                     name);
       var backend = await this.storagePath.backend()

       if (!backend.writeStream)
           throw( new Exc.Forbidden('The backend can not handle files.'))

       var childStoragePath = await this.storagePath.createChild(name, false);
       var child = this._wrapStoragePath(childStoragePath);
       return child
   },

    _wrapStoragePath(sp) {
        var isFolder = sp.isFolder();
//        console.log("Wrapping",sp.name,isFolder,sp.inode)
        if (isFolder) {
            return FSDirectory.new(sp)
        } else {
            return FSFile.new(sp)
        }
    }

})


module.exports = FSDirectory;
