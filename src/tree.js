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
        await sp.initialize()
        if (sp.inode) {
            var node;
            if (sp.isFolder()) {
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
        await sp.initialize()
        if (sp.inode) {
            if (node.isFolder()) {
                return node
            } else {
                throw "Is Existing but file"
            }
        } else {
            await node.ensure(true)
            return node
        }
    },
    // read(path, start, end) -> stream
    // write(stream,path) -> ??? signal done
    // stat(path)


    async move(moveInfo) {
        console.log("MOVE",moveInfo.source,moveInfo.destination)
        if (moveInfo.destinationNode) {
            console.log("Don't know what to do yet")
        } else {
            await moveInfo.sourceNode.moveToParent(
                moveInfo.destinationParentNode,
                moveInfo.destinationName)
        }
    },

    async copy(copyInfo) {
        console.log("copy",copyInfo.source,copyInfo.destination)
        var destExists= !!copyInfo.destinationNode



    },

})

module.exports=inodesTree;
