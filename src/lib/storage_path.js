const models = require('../models');
const asyncs = require("async");
const Backends = require('../backends');

// This works map paths to a bunch of inodes
// or tries to do this (ensure).
// It also allows modification
// remove, createChild,

class StoragePath {
    // inodes is optional but can drastically reduce
    // db accesses
    //path is without !!!! leading '/'
    constructor(path, tree, inodes) {
        this.path=path
        this.tree=tree
        this.inodes=inodes //optional for speedup

    }

    async initialize(force) {
        if (this.path=='' || !this.path) {
            this.path=''
            this.path_parts=['/']
            this.name='/'
        } else {
            if (this.path.charAt(0) == '/')
                this.path=this.path.substring(1);
            this.path_parts=['/'].concat(this.path.split('/'))
            this.name=this.path_parts[this.path_parts.length-1]
        }

        if (force || !this.inodes)
            this.inodes=await models.Inode.resolvePath('/'+this.path);

        this.isExisting=(this.inodes.length == this.path_parts.length)
        if (this.isExisting) {
            this.inode=this.inodes[this.inodes.length-1]
            this.entry=this.inode
        }
    }

    async backend() {
        var backendInode
        var downPath=[]
        this._throwNonExisting("no backend")
        this.inodes.forEach((inode) => {
            if (inode.backend_id) {
                backendInode = inode
                downPath=[]
            } else {
                downPath.push(inode.name)
            }
        })

        var backend = await backendInode.getBackend();
        var config = Object.assign({}, backend.params)
        config.downPath=downPath.join('/')
//        console.log("Instanciating Backend", backend.backend_type, config)
        return Backends.instance(backend.backend_type, config);
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
        var cs =await this.inode.children(this.tree.userContext())
        var wrappedCs = await Promise.all(cs.map( async (inodeChild) => {
            return await this._wrapInode(inodeChild)
        }))
//                console.log("wraped Children:", cs, wrappedCs)
        return wrappedCs
    }

/*    async child(name) {
        this._throwNonExisting("doesn't have a child")
        if (!this.inode.is_folder)
            throw("Only folder can have children")

        return this._wrapInode(await this.inode.child(name))
    }*/

    async createChild(name,isFolder) {
        this._throwNonExisting("can't create children")
            var child=await models.Inode.create(
                {name: name,
                 parent_id: this.inode.id,
                 is_folder: isFolder,
                 created_at: new Date(),
                 modified_at: new Date(),
                 updated_at: new Date(),
                 readers: this.inode.readers,
                 writers: this.inode.writers,
                 admins: this.inode.admins
                })
            return await this._wrapInode(child)
    }

    async remove() {
        this._throwNonExisting("can't be removed")
        //if (this.inode.is_folder) {
            //TBD: delete each of them so we can emit events
            // get the first 1000 deepest inodes
            // and destroy them
        //    await models.Inode.deleteDescendants(this.inode.id)
        //} else {
        var backend=await this.backend()
        await backend.remove()
        await this.inode.destroy();
        this.inode=null //TBD: do it cleaner by poping from inodes
        this.entry=null
        this.isExisting=false
        //}
    }

    //move to a new parent or rename it
    async move(newParent, newName) {
        this._throwNonExisting("can't be moved")
        // move each of them separately
        var parentEntry= newParent.inode;
        var thisEntry = this.inode;
        var newPath=newParent.path+'/'+newName

        var srcBackend= await this.backend()
        var destBackend= await newParent.backend()
        await srcBackend.move(destBackend.config.downPath+newName)
//        console.log("StoragePath: move ", newParent, newName,
//                    parentEntry.id, thisEntry.id);
        await thisEntry.update({
            parent_id: parentEntry.id,
            name: newName
        })
        this.inodes=null
        this.path=newPath
        await this.initialize(true);
    }


    async copy(newParent, newName) {
        this._throwNonExisting("can't be moved")
        // move each of them separately
        var parentInode= newParent.inode;
//        console.log("StoragePath: copy ", newName)
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

    async _wrapInode(inode) {
//        console.log("wrapping:", this)
        var sp= new StoragePath(
            this.path+'/'+inode.name,
            this.tree,
            [].concat(this.inodes).concat([inode])
        )
        await sp.initialize()
        return sp
    }

    _throwNonExisting(msg) {
        if (!this.entry)
            throw(`Non Existing node: ${msg}`)

    }

}

module.exports=StoragePath
