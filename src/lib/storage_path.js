const models = require('../models');

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
        console.log(inodes.length, this.path, this.path_parts,
                    this.path_parts.length)
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
                    return new StoragePath(
                        this.path+'/'+inodeChild.name,
                        this.user,
                        [].concat(this._inodes).concat([inodeChild])
                    )
                })
            } else {
                return [] // or error?
            }
        } else {
          return [] //or error?
        }
    }

   getName() {
        console.log("getName",this.path)
       return this.name
    }

    getLastModified(cb) {
        return this.entry().then(entry => {cb(entry.modified_at)})
    }
    getSize(cb) {
        return this.entry().then(entry => {cb(2000)})
    }
    getQuotaInfo(cb) {
       // used, available,
        return this.entry().then(entry => {cb([4000,8000])})
    }
    getETag(cb) {
        // used, available,
        return this.entry().then(entry => {cb("xfjztcrcuzr")})
    }
    getContentType(cb) {
        // used, available,
        return this.entry().then(entry => {cb("video/avi")})
    }

    getChildren(cb) {
        console.log("getChildren",this.path)
        this.children().then(children => {
            console.log(children)
            cb(null,children)
        })
    }

    getHref(cb) {
        console.log("getHref")
    }

    getChild(cb) {
        console.log("getChild CALLED!")
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

}

module.exports=StoragePath
