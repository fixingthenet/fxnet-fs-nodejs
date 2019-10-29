var jsDAV_Tree = require("jsDAV/lib/DAV/tree");

var Exc = require("jsDAV/lib/shared/exceptions");
var Util = require("jsDAV/lib/shared/util");

const FSFile=require('./frontends/dav/file');
const FSDirectory=require('./frontends/dav/directory');
const StoragePath=require('./lib/storage_path');

const jwt=require('jsonwebtoken')
const fs = require('fs')
var publicKey= fs.readFileSync('config/secrets/cert.pem')
// provides the level of linux tools like:
// touch, cp -a, mv, rm -rf, mkdir -p
var inodesTree = jsDAV_Tree.extend ({

    initialize(handler) {
        this.handler=handler

    },

    async getNodeForPath(path) {
        var sp=new StoragePath(path,null,null,this);
        await sp.initialize()
        if (sp.inode) {
            return FSDirectory.wrap(sp, this)
        } else {
            throw(new Exc.FileNotFound(`File at location ${path} not found`))
        }
    },

    readFile(node, start, end) {
        return node.getStream(start, end)
    },

    async writeFile(parent, name, node) {
        if (!node)
            var node = await parent.createFile(name)
        var stream= await node.putStream();
        return { stream: stream, node: node }
    },

    delete(node) {
        return node["delete"]()
    },

    lsDir(parent) {
        return parent.getChildren()
    },


    async mkDir(parent, name, resourceType, properties ) {
        var backend=await parent.storagePath.backend()
        if (backend.mkdir) {
            await backend.mkdir(name,resourceType, properties)
        }
        return await parent.createExtendedCollection(name,
                                                     resourceType,
                                                     properties
                                                    );
    },


    async move(moveInfo) {
        console.log("MOVE",moveInfo.source,moveInfo.destination)
        if (moveInfo.destinationNode) {
            console.log("Don't know what to do yet")
        } else {
            await moveInfo.sourceNode.moveToParent(
                moveInfo.destinationParentNode,
                moveInfo.destinationName)
        }
    },

    async copy(copyInfo) {
        console.log("copy",copyInfo.source,copyInfo.destination)
        await copyInfo.sourceNode.copyToParent(
            copyInfo.destinationParentNode,
            copyInfo.destinationName)
    },

    userContext() {
        if (this.userCtx)
            return this.userCtx

        try {
            var token=this.handler.plugins.auth.authBackend.getCurrentUser().sessionLogin.token
            var jwtc = jwt.verify(token, publicKey)
            console.log("auth", token,jwtc)
            this.userCtx = {user: jwtc.user}
        } catch(e) {
            this.userCtx = { user: {id: 0, login: "guest"}}
            console.error("Getting authentificiation failed:",e)
        }

        return this.userCtx
    },

})

module.exports=inodesTree;
