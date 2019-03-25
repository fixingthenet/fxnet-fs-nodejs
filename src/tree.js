//var jsDAV_Tree = require("jsDAV/lib/DAV/tree");

var jsDAV_Tree = require("jsDAV/lib/DAV/tree");

var Exc = require("jsDAV/lib/shared/exceptions");
var Util = require("jsDAV/lib/shared/util");
const iFile = require("jsDAV/lib/DAV/interfaces/iFile");
const iCollection = require("jsDAV/lib/DAV/interfaces/iCollection");

//var jsDAV_FS_Directory = require("./directory");
//var jsDAV_FS_File = require("./file");
const FSFile=require('./frontends/dav/file');
const FSDirectory=require('./frontends/dav/directory');
const StoragePath=require('./lib/storage_path');

var inodesTree = jsDAV_Tree.extend({

   initialize(basePath) {
        this.basePath = basePath;
    },

    async getNodeForPath(path, cbfstree) {
        //console.log("getNodeforPATH", path);
        var sp=new StoragePath(path,null,null);
        //console.log("StroragPath", sp.path,sp.path_parts);
        var exists= await sp.isExisting()
        if (exists) {
            var isFolder = await sp.isFolder();
            var node;
            if (isFolder) {
                node = FSDirectory.new(sp, this.basePath)
            } else {
                node = FSFile.new(sp, this.basePath)
            }
            //console.log("Node", node.hasFeature(iFile), node.hasFeature(iCollection))
            return cbfstree(null,node)
        } else {
                //console.log("doesn't exist", sp.path)
                return cbfstree(new Exc.FileNotFound(`File at location ${path} not found`));
        }
    },

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
