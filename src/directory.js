var jsDAViNode = require("jsDAV/lib/DAV/interfaces/iNode");
var jsDAV_FS_File=require('./file')

var directory = jsDAViNode.extend({
    initialize: function(sp) {
        this.storagePath = path;
    },

    getChildren: function(cbfsgetchildren) {
        console.log("getChildren:", this.name)
        var nodes = [];
        this.storagePath.children.then( children => {

        } )
             .each(function(file, cbnextdirch) {
                 nodes.push(file.stat.isDirectory()
                     ? jsDAV_FS_Directory.new(file.path)
                     : jsDAV_FS_File.new(file.path)
                 );
                 cbnextdirch();
             })
             .end(function() {
                 cbfsgetchildren(null, nodes);
             });
    }
})
module.exports=directory
