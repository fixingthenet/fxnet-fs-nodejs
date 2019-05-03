var jsDAV_Tree = require("jsDAV/lib/DAV/tree");

var Exc = require("jsDAV/lib/shared/exceptions");
var Util = require("jsDAV/lib/shared/util");

const FSFile=require('./frontends/dav/file');
const FSDirectory=require('./frontends/dav/directory');
const StoragePath=require('./lib/storage_path');

// provides the level of linux tools like:
// touch, cp -a, mv, rm -rf, mkdir -p
var inodesTree = jsDAV_Tree.extend ({

   initialize(basePath) {
        this.basePath = basePath;
    },

    async getNodeForPath(path, cbfstree) {
        var sp=new StoragePath(path,null,null,this);
        var exists= await sp.isExisting()
        if (exists) {
            var isFolder = await sp.isFolder();
            var node;
            if (isFolder) {
                node = FSDirectory.new(sp)
            } else {
                node = FSFile.new(sp)
            }
            if (cbfstree) {
                return cbfstree(null,node)
            } else {
                return node
            }
        } else {
            if (cbfstree) {
                return cbfstree(new Exc.FileNotFound(`File at location ${path} not found`));
            } else {
                throw(new Exc.FileNotFound(`File at location ${path} not found`))
            }
        }
    },

    // touch(path, size,mime_major,mime_minor, ecoding, key, sha512, created_at, modified_at )

    // mkdir(path, parent, created_at, modified_at )
    async mkdir(path, ensureParents, created_at, modified_at ) {
        console.log("mkdir",path, ensureParents, created_at, modified_at);
        var node =  new StoragePath(path, null, null, this);
        var exists = await node.isExisting();
        if (exists) {
            if (await node.isFolder()) {
                return node
            } else {
                throw "Is Existing but file"
            }
        } else {
            node.ensure(true)
            return node
        }
    },
    // read(path, start, end) -> stream
    // write(stream,path) -> ??? signal done
    // stat(path)


    async move(sourceName, destName, cb) {
        console.log("move",sourceName,destName)
        var source = new StoragePath(sourceName,null,null);
        var sourceExists= await source.isExisting();
        var dest = new StoragePath(destName,null,null);
        var destExists= await dest.isExisting();

        // if the dest's parent doesn't exist then stop
        // if dest exists remove the dest
        // change the entry's name and it's parent
        // only move things I own? then move is expensive
        // what's with the overwrite header?
        // how to return problematic things

        cb(null,null)
    },

    async copy(sourceName, destName, cb) {
        console.log("copy",sourceName,destName)
        var source = new StoragePath(sourceName,null,null);
        var sourceExists= await source.isExisting()
        var dest = new StoragePath(destName,null,null);
        var destExists= await dest.isExisting()
        // how does copy work?
        // merge the destination?
        // what's with the overwrite header?

        cb(null,null)
    }

})

module.exports=inodesTree;
