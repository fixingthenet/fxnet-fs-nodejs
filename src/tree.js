//var jsDAV_Tree = require("jsDAV/lib/DAV/tree");

var jsDAV_Tree = require("jsDAV/lib/DAV/backends/fs/tree");
var jsDAV_FS_Directory = require("./directory");
var jsDAV_FS_File = require("./file");
var Exc = require("jsDAV/lib/shared/exceptions");
var Util = require("jsDAV/lib/shared/util");
const Fs= require("fs")
const iFile = require("jsDAV/lib/DAV/interfaces/iFile");
const iCollection = require("jsDAV/lib/DAV/interfaces/iCollection");
const FSFile=require('./frontends/dav/file');
const FSDirectory=require('./frontends/dav/directory');
const StoragePath=require('./lib/storage_path');

var inodesTree = jsDAV_Tree.extend({
    getNodeForPath: async function(path, cbfstree) {
        console.log("getNodeforPATH", path);
        var sp=new StoragePath(path,null,null);
        console.log("StroragPath", sp.path,sp.path_parts);
        var exists= await sp.isExisting()
        if (exists) {
            var isFolder = await sp.isFolder();
            var node;
            if (isFolder) {
                node = FSDirectory.new(sp)
            } else {
                node = FSFile.new(sp)
            }
            console.log("Node", node.hasFeature(iFile), node.hasFeature(iCollection))
            return cbfstree(null,node)
        } else {
                console.log("doesn't exist", sp.path)
                return cbfstree(new Exc.FileNotFound(`File at location ${path} not found`));
        }
    }
})

module.exports=inodesTree;
