const models = require('../models');

class StorageInode {
    constructor(path, user) {
        this.path=path;
        this._inodes=null;

        if (path=='/') {
            this.path_parts=['']
        } else {

            if (this.path.slice(0,1) != '/') {
                throw "Abolute path required"
            }
            // remove all trailing / es just leave the root one
            if (this.path.slice(path.legth-1,path.length) == '/' && this.path.length > 1) {
                this.path=this.path.slice(0,path.length-1)
            }

            this.path_parts=path.split('/')
        }
    }

    async inodes() {
        if (!this._inodes) {
            this._inodes=await models.Inode.resolvePath(this.path);
        }
        return this._inodes
    }

    async isExisting() {
        return (await this.inodes()).length == this.path_parts.length
    }

    async entry() {
        var i=await this.inodes();
        return i[i.length-1]
    }

    async children() {
        if (await this.isExisting()) {
            var e=await this.entry()
            if (e.is_folder) {
                return await e.children()
            } else {
                return [] // or error?
            }
        } else {
          return [] //or error?
        }
    }
}

module.exports=StorageInode
