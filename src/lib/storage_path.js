const models = require('../models');
const asyncs = require("async");

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
        this.inodes=inodes;
        this.tree=tree;

        if (path=='' || !path) {
            this.path=''
            this.path_parts=['/']
            this.name='/'
        } else {
            if (path.charAt(0) == '/')
                path=path.substring(1);
            this.path_parts=['/'].concat(path.split('/'))
            this.name=this.path_parts[this.path_parts.length-1]
        }
    }

    async initialize() {
        if (!this.inodes)
            this.inodes=await models.Inode.resolvePath('/'+this.path);
        this._refresh()
    }

    _refresh() {
        this.isExisting=(this.inodes.length == this.path_parts.length)
        if (this.isExisting) {
            this.inode=this.inodes[this.inodes.length-1]
            this.entry=this.inode
        }
    }
    // ensures the existance of the path
    // if isFolder is true then the resulting paath fill be a folder
    // if not it will be an empty file with mimetype TBD???
    async ensure(isFolder) {
        var existing_path_parts=[]
        for (var i = 0; i < this.path_parts.length; i++) {
            var dirname=this.path_parts[i]
//            console.log("looping",i,
            //                        dirname,
            //          this.inodes[i],
            //          this.path_parts,
            //          existing_path_parts)
            if (this.inodes[i]) {
                existing_path_parts.push(dirname)
            } else {
                var new_child=await models.Inode.create(
                    {name: dirname,
                     parent_id: this.inodes[i-1].id,
                     is_folder: true,
                     created_at: new Date(),
                     modified_at: new Date(),
                     updated_at: new Date(),
                    })
                this.inodes.push(new_child)
                this._refresh()
            }
        }
    }

    contentType() {
        this._throwNonExisting("Inode has no content type")
        return `${this.inode.content_type_major}/${this.inode.content_type_minor}`
    }

    isFolder() {
        // we treat nonexistinent things as folders
        this._throwNonExisting("Inode doesn't know if it's a folder")
        //if (this.isExisting)
            return this.inode.is_folder
        //else
        //    return true
    }

    async children() {
        this._throwNonExisting("doesn't have children")
        if (!this.inode.is_folder)
            throw("Only folder can have children")
        var cs =await this.inode.children()
        var wrappedCs = cs.map( (inodeChild) => {
            return this._wrapInode(inodeChild)
        })
        //        console.log("wraped Children:", cs, wrappedCs)
        return wrappedCs
    }

    async child(name) {
        this._throwNonExisting("doesn't have a child")
        if (!this.inode.is_folder)
            throw("Only folder can have children")

        return this._wrapInode(await this.inode.child(name))
    }

    async createChild(name,isFolder) {
        this._throwNonExisting("cant'create children")
        try {
            var child=await models.Inode.create(
                {name: name,
                 parent_id: this.inode.id,
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
        this._throwNonExisting("can't be removed")
        if (this.inode.is_folder) {
            //TBD: delete each of them so we can emit events
            // get the first 1000 deepest inodes
            // and destroy them
            await models.Inode.deleteDescendants(this.inode.id)
        } else {
            await this.inode.destroy();
            this.inode=null //TBD: do it cleaner by poping from inodes
            this.entry=null
            this.isExisting=false
        }
    }


    async move(newParent, newName) {
        this._throwNonExisting("can't be moved")
        // move each of them separately
        var parentEntry= newParent.inode;
        var thisEntry = this.inode;
//        console.log("StoragePath: move ", newParent, newName,
//                    parentEntry.id, thisEntry.id);
        await thisEntry.update({
            parent_id: parentEntry.id,
            name: newName
        })
        this.inodes=null;
        await this.initialize();
        //TBD: move the backend files
    }


    async copy(newParent, newName) {
        this._throwNonExisting("can't be moved")
        // move each of them separately
        var parentInode= newParent.inode;
        console.log("StoragePath: copy ", newName)
        await this.inode.copy(parentInode, newName)
        // TBD copy the backend
    }

    async updateMetaContent(atts) {
        await this.inode.update(atts)
        return this;
    }

    // low level functions

    async storageKey() {
        return this.inode.storage_key
    }

    _wrapInode(inode) {
//        console.log("wrapping:", this)
        var sp= new StoragePath(
            this.path+'/'+inode.name,
            this.user,
            [].concat(this.inodes).concat([inode]),
            this.tree
        )
        sp._refresh()
        return sp
    }

    _throwNonExisting(msg) {
        if (!this.entry)
            throw(`Non Existing node: ${msg}`)

    }

}

module.exports=StoragePath
