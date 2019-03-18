const EventEmitter = require('events');
const Fs = require('fs');

class BinaryStoreReadStream extends EventEmitter {
    constructor(storagePath,start,end) { //options: start,end
        //super({emitClose: true});
        super();
        this.storagePath=storagePath
        this.basePath='/code/public/';
        this.start=start;
        this.end=end

        var options;
        if (typeof start == "number" && typeof end == "number")
            options = { start: start, end: end };
    }

    async init(){
        var path = await this.storagePath.storageKey();
        var stream = Fs.createReadStream(this.basePath+path,
                                         this.options);
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
