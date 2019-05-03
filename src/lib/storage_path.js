const models = require('../models');

// This works map paths to a bunch of inodes
// or tries to do this (ensure).
// It also allows modification
// remove, createChild,

class StoragePath {
    // inodes is optional but can drastically reduce
    // db accesses
    //path is without !!!! leading '/'
    constructor(path, user, inodes,tree) {
        this.path=path;
        this.user = user;
        this._inodes=inodes;
        this.tree=tree;

        if (path=='') {
            this.path=''
            this.path_parts=['/']
            this.name='/'
        } else {
            this.path_parts=['/'].concat(path.split('/'))
            this.name=this.path_parts[this.path_parts.length-1]
        }
    }

    async isExisting() {
        var inodes=await this.inodes()
        console.log("isExisting", inodes, inodes.length,
                    this.path, this.path_parts,
                    this.path_parts.length)
        return inodes.length == this.path_parts.length
    }

    // ensures the existance of the path
    // if isFolder is true then the resulting paath fill be a folder
    // if not it will be an empty file with mimetype TBD???
    async ensure(isFolder) {
        var inodes=await this.inodes()
        console.log("Inodes so far",inodes)
        var existing_path_parts=[]
        for (var i = 0; i < this.path_parts.length; i++) {
            var dirname=this.path_parts[i]
            console.log("looping",i,
                        dirname,
                        inodes[i],
                        this.path_parts,
                        existing_path_parts)
            if (inodes[i]) {
                existing_path_parts.push(dirname)
            } else {
                var new_child=await models.Inode.create(
                    {name: dirname,
                     parent_id: inodes[i-1].id,
                     is_folder: true,
                     created_at: new Date(),
                     modified_at: new Date(),
                     updated_at: new Date(),
                    })
                inodes.push(new_child)
            }
        }
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

    // low level functions
    async inodes() {
        if (!this._inodes) {
            this._inodes=await models.Inode.resolvePath('/'+this.path);
        }
        return this._inodes
    }

    async entry() {
        var i=await this.inodes();
        return i[i.length-1]
    }

    async storageKey() {
        var e = await this.entry();
        return e.storage_key
    }

    _wrapInode(inode) {
        return new StoragePath(
            this.path+'/'+inode.name,
            this.user,
            [].concat(this._inodes).concat([inode]),
            this.tree
        )
    }

}

module.exports=StoragePath
