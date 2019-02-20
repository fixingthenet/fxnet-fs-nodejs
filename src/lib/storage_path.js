const models = require('../models');
const Exc = require("jsDAV/lib/shared/exceptions");
const Fs = require('fs');
const stream = require('stream');
const crypto = require('crypto')

class BinaryStoreWriteStream extends stream.Writable {
    constructor(storagePath) {
        super({emitClose: true});
        this.storagePath=storagePath
        this.bytes_written=0
        this.shasum = crypto.createHash('sha512');
    }

    _write(chunk, enc, next) {
        console.log("RECEIVED:",chunk.length)//,chunk.toString('ascii'));
        this.shasum.update(chunk.toString('ascii'));
        this.bytes_written =  this.bytes_written + chunk.length
        next();
    }

    etag() {
        return this.shasum.digest('hex');
    }
}

class StoragePath {
    // inodes is optional but can drastically reduce
    // db accesses
    constructor(path, user, inodes) {
        this.path=path;
        this.user = user;
        this._inodes=inodes;

        if (path=='') {
            this.path=''
            this.path_parts=[]
            this.name='/'
        } else {
            this.path_parts=path.split('/')
            this.name=this.path_parts[this.path_parts.length-1]
        }
    }

    async inodes() {
        if (!this._inodes) {
            this._inodes=await models.Inode.resolvePath('/'+this.path);
        }
        return this._inodes
    }

    async isExisting() {
        var inodes=await this.inodes()
        console.log("isExisting", inodes.length,
                    this.path, this.path_parts,
                    this.path_parts.length+1)
        return inodes.length == this.path_parts.length+1
    }

    async entry() {
        var i=await this.inodes();
        return i[i.length-1]
    }

    async children() {
        if (await this.isExisting()) {
            var e=await this.entry()
            if (e.is_folder) {
                return (await e.children()).map(inodeChild => {
                    return this._wrapInode(inodeChild)
                })
            } else {
                return [] // or error?
            }
        } else {
          return [] //or error?
        }
    }

    async child(name) {
        if (await this.isExisting()) {
            var e=await this.entry()
            if (e.is_folder) {
                return this._wrapInode(await e.child(name))
            }
        }
    }

    async createChild(name,isFolder) {
        try {
            var e=await this.entry()
            var child=await models.Inode.create(
                {name: name,
                 parent_id: e.id,
                 is_folder: isFolder,
                 created_at: new Date(),
                 modified_at: new Date(),
                 updated_at: new Date(),
                })
            return this._wrapInode(child)
        } catch(e) {
            return null
        }
    }

    _wrapInode(inode) {
        return new StoragePath(
            this.path+'/'+inode.name,
            this.user,
            [].concat(this._inodes).concat([inode])
        )
    }
    //-------------------------------------------
    // inode,icollection, ifile
    // needs lots of redesign

   getName() {
        console.log("getName",this.path)
       return this.name
    }


    getLastModified(cb) {
        console.log("getLastModified",this.path)
        this.entry().then(entry => {
            console.log(entry.modified_at)
            cb(null,entry.modified_at)
        })
    }
    getSize(cb) {
        this.entry().then(entry => {cb(null,2000)})
    }
    getQuotaInfo(cb) {
       // used, available,
        this.entry().then(entry => {cb(null,[400,8000000000])})
    }
    getETag(cb) {
        this.entry().then(entry => {cb(null,"xfjztcrcuzr")})
    }
    getContentType(cb) {
        this.entry().then(entry => {cb(null,"video/avi")})
    }

    getChildren(cb) {
        console.log("getChildren",this.path)
        this.children().then(children => {
            console.log("Children:",children)
            cb(null,children)
        })
    }

    getHref(cb) {
        console.log("getHref")
        cb(path)
    }

    getChild(name,cb) {
        this.child(name).then(child => {
                cb(null,child)
        }).catch(e => {
                cb(Exc.FileNotFound(`File not found`))
        })
    }


    getProperties(cb) {
        console.log("getProperties CALLED!")
    }

    exists(cb) {
        this.isExisting().then(exists => {
            cb(null, exists)
        })
    }

    hasFeature() {
        return true
    }

    getProperties(properties, cbgetprops) {
            cbgetprops(null, []);
    }

    createExtendedCollection(newName, resourceType, properties, cb) {
        console.log("createextendedcollection",newName,resourceType, properties)
        this.createChild(newName,true).then(child => {
            cb(null, child)
        })
    }

    async createFileStream(handler, name,enc,cb) {
        var size = handler.httpRequest.headers["x-file-size"];
        console.log("createFileStream", this.path, name, enc, size);

        var child = await this.createChild(name, false)

        if (size) {
            if (!handler.httpRequest.headers["x-file-name"])
                handler.httpRequest.headers["x-file-name"] = name;
            //            this.writeFileChunk(handler, enc, cbfscreatefile);
            cb(Exc.FileNotFound('ups'))

        } else {
            var stream = new  BinaryStoreWriteStream(child)
            stream.on("finish",() => {
                console.log("upload done (finish)",stream.bytes_written);
                stream.destroy();

            })
            stream.on("close",() => {
                console.log("upload done (close)",stream.bytes_written)})
            handler.getRequestBody(enc, stream, true, cb);
        }
    }

     async createFileStreamRaw(name, stream, enc, cbfscreatefile) {
         console.log("createFileStreamRaw", name)
         var child = await this.createChild(name, false)
         var stream = new  BinaryStoreWriteStream(child)
         stream.on("finish",() => {
             console.log("upload done",stream.bytes_written)})

         stream.pipe(stream);
     }

    async createFile(name, data, enc, cb) {
        console.log("createFile", data.length)
         //var child = await this.createChild(name, false)
         //var stream = new  BinaryStoreWriteStream(child)
         //stream.on("finish",() => {
         //    console.log("upload done",stream.bytes_written)})
        //if (data.length === 0) {
        //     data = new Buffer(0);
        //     enc  = "binary";
        // }
        // stream.write(data)
     }

}

module.exports=StoragePath
