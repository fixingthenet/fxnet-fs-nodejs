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
        var sp=new StoragePath(path,this);
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
        return await parent.createDirectory(name,
                                            resourceType,
                                            properties
                                           );
    },


    async move(moveInfo) {
        console.log("MOVE",moveInfo.source,moveInfo.destination,
                    moveInfo.destinationExists, moveInfo.overwrite)
        var backendSrc=await moveInfo.sourceNode.storagePath.backend()
        var backendDestParent=await moveInfo.destinationParentNode.storagePath.backend()
        if (backendSrc.id != backendDestParent.id)
            throw( new Exc.NotImplemented('Cross backend move not implemented'))
//        if (moveInfo.overwrite && moveInfo.destinationExists) {
//            console.log("overwriting existing", moveInfo.destinationNode.isExisting(), moveInfo.destinationNode)
//            await this["delete"](moveInfo.destinationNode)
//        }

        await this.recursiveMove(moveInfo.sourceNode,
                        moveInfo.destinationParentNode,
                        moveInfo.destinationName
                                )



    },

    async recursiveMove(node, destParentNode, name) {
        if (node.getSize) { //file
            console.log("move file", node.path(), destParentNode.path(), name)
            var dest = await node.moveToParent(destParentNode, name)
        } else {
            console.log("move  dir", node.path(), destParentNode.path(), name)
            var dest = await node.moveToParent(destParentNode, name)
            //children=await node.getChildren()
            //children.forEach( async (node)=>{
            //    await this.recursiveMove(node,dest,node.getName())
            //})
        }
    },

    async copy(copyInfo) {
        console.log("COPY",copyInfo.source,copyInfo.destination)
        await this.recursiveCopy(copyInfo.sourceNode,
                        copyInfo.destinationParentNode,
                        copyInfo.destinationName
                       )
    },

    async recursiveCopy(node,destParentNode, name) {
        if (node.getSize) {
            console.log("copy file", node.path(), destParentNode.path(), name)
            var dest = await destParentNode.createFile(name)
        } else {
            console.log("copy  dir", node.path(), destParentNode.path(), name)
            var dest = await destParentNode.createDirectory(name)
            children=await node.getChildren()
            children.forEach( async (node)=>{
                await this.recursiveCopy(node,dest,node.getName())
            })
        }
    },

    async updateProperties(node, props) {
//        console.log("tree updateProperties", node.path(), props)
        await node.updateProperties(props)
        return true
    },

    async getProperties(node,props) {
//        console.log("tree getProperties", node.path(), props)
        return await node.getProperties(props)
    },

    userContext() {
        if (this.userCtx)
            return this.userCtx

        try {
            var token=this.handler.plugins.auth.authBackend.getCurrentUser().sessionLogin.token
            var jwtc = jwt.verify(token, publicKey)
//            console.log("auth", token,jwtc)
            this.userCtx = {user: jwtc.user}
        } catch(e) {
            this.userCtx = { user: {id: 0, login: "guest"}}
            console.error("Getting authentificiation failed:",e)
        }

        return this.userCtx
    },

})

module.exports=inodesTree;
