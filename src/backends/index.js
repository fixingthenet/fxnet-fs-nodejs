class Backends {
    constructor() {
        this._backends={}
    }

    register(backend) {
        this._backends[backend.identifier]=backend
        return this
    }

    get(identifier) {
        return this._backends[identifier]
    }

    instance(identifier, config) {
        var klass = this.get(identifier)
        return (new klass(config))
    }
}


module.exports = new Backends
