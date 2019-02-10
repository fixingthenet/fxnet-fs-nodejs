//var jsDAV_Tree = require("jsDAV/lib/DAV/tree");

var jsDAV_Tree = require("jsDAV/lib/DAV/backends/fs/tree");
var jsDAV_FS_Directory = require("./directory");
var jsDAV_FS_File = require("./file");
var Exc = require("jsDAV/lib/shared/exceptions");
var Util = require("jsDAV/lib/shared/util");
const Fs= require("fs")
const StoragePath=require('./lib/storage_path');

var inodesTree = jsDAV_Tree.extend({
    getNodeForPath: function(path, cbfstree) {
        console.log("getNodeforPATH", path);
        var sp=new StoragePath(path,null,null);
        console.log("StroragPath", sp.path,sp.path_parts);
        sp.isExisting().then(exists => {
            if (!exists) {
                console.log("doesn't exist", sp.path)
                return cbfstree(new Exc.FileNotFound(`File at location ${path} not found`));
            }

            console.log("getNodeforpath result",sp)
            return cbfstree(null,sp)

        })
    }
})

module.exports=inodesTree;
