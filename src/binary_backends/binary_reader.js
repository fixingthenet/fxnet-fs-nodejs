const EventEmitter = require('events');
const Fs = require('fs');

class BinaryStoreReadStream extends EventEmitter {
    constructor(file,start,end) { //options: start,end
        //super({emitClose: true});
        super();
        this.file=file;
        this.start=start;
        this.end=end

        this.options={};
        if (typeof start == "number" && typeof end == "number")
            this.options = { start: start, end: end };
    }

    pause() {
        return this.stream.pause()
    }

    resume() {
        return this.stream.resume()
    }




    async init(){
        var path = await this.file.storagePath.storageKey();
        var fullPath = this.file.basePath()+path;
        this.stream = Fs.createReadStream(fullPath,
                                         this.options);
        console.log("BinaryStoreReadStream: init", fullPath, this.start, this.end, this.options)

        this.stream.on("data", (data) => {
            this.emit("data",data)
        });

        this.stream.on("error", (err) => {
            this.emit("error",err)
        });

        this.stream.on("end", () => {
            this.emit("end")
        });
    }



}
module.exports = BinaryStoreReadStream;
