class Backends {
    constructor() {
        this._backends={}
    }

    register(backend) {
        this._backends[backend.name]=backend
        return this
    }

    get(name) {
        return this._backends[name]
    }
}


module.exports = new Backends
