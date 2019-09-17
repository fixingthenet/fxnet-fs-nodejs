var Exc = require("jsDAV/lib/shared/exceptions");

class JustMeta {
    constructor(config) {
    }

//    async readStream(file, start, end) {
//        throw( new Exc.Forbidden('The JustMeta can not handle files.'))
//    }

//    async writeStream(file) {
//        throw( new Exc.Forbidden('The JustMeta can not handle files.'))
//    }

}

JustMeta.name='JustMeta'

module.exports= JustMeta
