const models = require('../models');
const Exc = require("jsDAV/lib/shared/exceptions");
//const BinaryStoreWriteStream = require("../binary_backends/binary_writer");


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

    async storageKey() {
        var e = await this.entry();
        return e.storage_key
    }

    async contentType() {
        var e = await this.entry()
        return `${e.content_type_major}/${e.content_type_minor}`
    }

    async isFolder() {
        var e=await this.entry()
        return e.is_folder
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

    async remove() {
        var e = await this.entry();
        if (e.is_folder) {
            //TBD: delete each of them so we can emit events
            // get the first 1000 deepest inodes
            // and destroy them
            await models.Inode.deleteDescendants(e.id)
        } else {
            await e.destroy();
        }
    }

    async updateMetaContent(atts) {
        var e = await this.entry();
        await e.update(atts)
        return this;
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





    // exists(cb) {
    //     this.isExisting().then(exists => {
    //         cb(null, exists)
    //     })
    // }

    // getProperties(properties, cbgetprops) {
    //     console.log("getProperties CALLED!")
    //     cbgetprops(null, []);
    // }

    // createExtendedCollection(newName, resourceType, properties, cb) {
    //     console.log("createextendedcollection",newName,resourceType, properties)
    //     this.createChild(newName,true).then(child => {
    //         cb(null, child)
    //     })
    // }

    // async createFileStreamRaw(name, stream, enc, cbfscreatefile) {
    //     console.log("createFileStreamRaw", name)
    //     var child = await this.createChild(name, false)
    //     var stream = new  BinaryStoreWriteStream(child)
    //     stream.on("finish",() => {
    //         console.log("upload done",stream.bytes_written)})

    //     stream.pipe(stream);
    // }

    // async createFile(name, data, enc, cb) {
    //     console.log("createFile", data.length)
    //     //var child = await this.createChild(name, false)
    //     //var stream = new  BinaryStoreWriteStream(child)
    //     //stream.on("finish",() => {
    //     //    console.log("upload done",stream.bytes_written)})
    //     //if (data.length === 0) {
    //     //     data = new Buffer(0);
    //     //     enc  = "binary";
    //     // }
    //     // stream.write(data)
    // }

}

module.exports=StoragePath
