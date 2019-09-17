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

    instance(name, config) {
        var klass = this.get(name)
        return (new klass(config))
    }
}


module.exports = new Backends
