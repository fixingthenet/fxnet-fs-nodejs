const EventEmitter = require('events');
const Fs = require('fs');

class BinaryStoreReadStream extends EventEmitter {
    constructor(file,start,end) { //options: start,end
        //super({emitClose: true});
        super();
        this.file=file;
        this.start=start;
        this.end=end

        var options;
        if (typeof start == "number" && typeof end == "number")
            options = { start: start, end: end };
    }

    async init(){
        var path = await this.file.storagePath.storageKey();
        var fullPath = this.file.basePath()+path;
        var stream = Fs.createReadStream(fullPath,
                                         this.options);
        console.log("BinaryStoreReadStream: init", fullPath, this.options)

        stream.on("data", (data) => {
            this.emit("data",data)
        });

        stream.on("error", (err) => {
            this.emit("error",err)
        });

        stream.on("end", () => {
            this.emit("end")
        });
    }


}
module.exports = BinaryStoreReadStream;
