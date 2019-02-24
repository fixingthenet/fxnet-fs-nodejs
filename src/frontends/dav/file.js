const iFile = require("jsDAV/lib/DAV/interfaces/iFile");
const FSNode = require("./node");
var FSFile = FSNode.extend(iFile, {
    //put
    //get
    getETag(cb) {
        this.storagePath.entry().then(entry => {cb(null,"xfjztcrcuzr")})
    },

    getContentType(cb) {
        this.storagePath.entry().then(entry => {cb(null,"video/avi")})
    },

    getSize(cb) {
        this.storagePath.entry().then(entry => {cb(null,2000)})
    }

})


module.exports = FSFile;
