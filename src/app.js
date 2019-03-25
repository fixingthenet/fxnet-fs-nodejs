//middleware
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
//const { applyMiddleware } = require('graphql-middleware');
//import server from './server';
const models = require('./models');
var jsdav = require('jsDAV/lib/jsdav');
const Url = require('url');
const jsDAV_Locks_Backend_FS = require("jsDAV/lib/DAV/plugins/locks/fs");
const authPlugin = require('jsDAV/lib/DAV/plugins/auth');
const authBackend = require('./auth');
const inodesTree = require('./tree');

async function start(listen) {
    // Make sure the database tables are up to date
    //    await models.sequelize.authenticate();
    var options = {
        port: 3000,
    }
    // Start the GraphQL server
    app.use(logger('dev'));
//    app.use(bodyParser.json());
//    app.use(cors());
//    server.applyMiddleware({ app });
//    await models.User.setup();
//    app.get('/api/', function (req, res) {
//        res.send('GET request to homepage');
//    });


    app.get('/api/health.json', (req,res) => {
        res.send(JSON.stringify({ "success": true}))
    })


    if (listen) {
        var httpServer=app.listen(options,() => {
            console.log(`Server is running on localhost`);
        })

        jsdav.debugMode=true;

        var jsdavServer=jsdav.mount({
            //node: __dirname + "/../public",
            tree: inodesTree.new('/code/public/'),
            server: httpServer,
            locksBackend: jsDAV_Locks_Backend_FS.new(__dirname + "/../locks"),
            authBackend: authBackend.new(),
            realm: "test",
            mount: '/',
            standalone: false,
            plugins: [
                authPlugin
                     ],
            //baseUri:
            //tree:
            //type:
            //sandboxed: false

            //realm:


        })

        var listeners = httpServer.listeners("request");
        httpServer.removeAllListeners("request");
        httpServer.addListener("request", function(req, resp) {
            var path = Url.parse(req.url).pathname;
            console.log("Path", path);
            if (path.charAt(path.length - 1) != "/")
                path = path + "/";
            if (path.match(/^\/api\/|^\/graphql\//)) { // exlude our paths here
                for (var i = 0, len = listeners.length; i < len; ++i)
                    listeners[i].call(httpServer, req, resp);
            } else {
                jsdavServer.exec(req, resp);
            }

        });
    }
}

module.exports= {
    start,
    models,
}
