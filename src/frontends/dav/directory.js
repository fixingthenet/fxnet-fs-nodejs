const BinaryStoreWriteStream = require("../../binary_backends/binary_writer");


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
    getChild(name,cb) {
        this.storagePath.child(name).then(child => {
            cb(null,this._wrapStoragePath(child))
        }).catch(e => {
            cb(Exc.FileNotFound(`File not found`))
        })
    },

    async getChildren(cb) {
        console.log("getChildren",this.storagePath.path)
        var children= await this.storagePath.children()
        async.map(children,
                  this._wrapStoragePath,
                  cb)
    },

    //iQuota
    async getQuotaInfo(cb) {
        // used, available,
        var entry = this.storagePath.entry()
        cb(null,[400,8000000000])
    },

// iHref
//    async getHref(cb) {
//        console.log("getHref")
//        cb(path)
//   },


     async createExtendedCollection(newName, resourceType, properties, cb) {
         console.log("createextendedcollection",newName,
                     resourceType, properties)
         var child = await this.storagePath.createChild(newName,true)
         if (child) {
             cb( null, child)
         } else {
             cb(Exc.Conflict(newName), null)
         }
     },


    async createFileStream(handler, name,enc,cb) {
        var size = handler.httpRequest.headers["x-file-size"];
        console.log("createFileStream", this.storagePath.path,
                    name, enc, size);

        var child = await this.storagePath.createChild(name, false)

        if (size) {
            if (!handler.httpRequest.headers["x-file-name"])
                handler.httpRequest.headers["x-file-name"] = name;
            //            this.writeFileChunk(handler, enc, cbfscreatefile);
            cb(Exc.FileNotFound('ups'))
        } else {
            var stream = new  BinaryStoreWriteStream(child)
            stream.on("finish",async () => {
                console.log("upload done (finish)",stream.bytes_written);
                var contentType=await stream.contentType();
                console.log("ContentType", contentType)
                stream.destroy();
            })
            stream.on("close",() => {
                console.log("upload done (close)",stream.bytes_written)})
            handler.getRequestBody(enc, stream, true, cb);
        }
    },

    async _wrapStoragePath(sp) {
        var isFolder = await sp.isFolder();
        console.log("Wrapping",sp.name,isFolder)
        if (isFolder) {
            return FSDirectory.new(sp)
        } else {
            return FSFile.new(sp)
        }
    }



})


module.exports = FSDirectory;
