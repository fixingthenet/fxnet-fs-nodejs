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
const JSONAPISerializer = require('jsonapi-serializer').Serializer;
const JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;

const jsDAV_Locks_Backend_FS = require("jsDAV/lib/DAV/plugins/locks/fs");
const authPlugin = require('jsDAV/lib/DAV/plugins/auth');
const authBackend = require('./auth');
const inodesTree = require('./tree');
const Backends = require('./backends');
var tree=inodesTree;

Backends.register(require('./backends/hashedLocal'));
Backends.register(require('./backends/justMeta'));
Backends.register(require('./backends/mirroredLocal'));

const uiTarget = process.env.UI_URL+'ui/'

async function start(listen) {
    // Make sure the database tables are up to date
    //    await models.sequelize.authenticate();
    var options = {
        port: 3000,
    }

    app.use(logger('dev'));

    // when adding something here don't forget to escape from the jdav servers below

    app.options('/ui', (req, res) => {
        console.log("Special ui options")
        res.end()
    })


    app.get('/api/v1/app_configurations/:id', (req, res) => {
        console.log("Special app confgiurations")
        var AppConfigurationSerializer = new JSONAPISerializer('app_configurations', {
            attributes: ['configuration']
        });
        var data={ configuration: {
            "oidc_issuer":"https://auth.dev.fixingthe.net",
            "oidc_client_id": "bc7bfb5df84e259d969ae7f8fbc7b7fe",
            "oidc_scopes": 'openid'
        }

                                  }
        var serialized = AppConfigurationSerializer.serialize(data);
        res.send(JSON.stringify(serialized))
    })


    app.get('/ep/health.json', (req,res) => {
        console.log("Special health")
        res.send(JSON.stringify({ "success": true}))
    })

    app.get('/', (req, res) => {
        console.log("Special redirect to ui" ,uiTarget)
        res.statusCode=301
        res.setHeader('Location', uiTarget)
        res.send()
    })

    if (listen) {
        var httpServer=app.listen(options,() => {
            console.log(`Server is running on localhost`);
        })

        jsdav.debugMode=true;

        var jsdavServer=jsdav.mount({
            //node: __dirname + "/../public",
            tree: tree,
            server: httpServer,
//            locksBackend: jsDAV_Locks_Backend_FS.new(__dirname + "/../locks"),
            authBackend: authBackend.new(),
            realm: "test",
            mount: '/',
            sandboxed: false,
            standalone: false,
            plugins: [
                authPlugin
            ],
        })

        // we hook in the jDav server first and then the current listeners
        var listeners = httpServer.listeners("request");
//        console.log("listeners:",listeners);
        httpServer.removeAllListeners("request");
        httpServer.addListener("request", function(req, resp) {
            req.pause()
            var path = Url.parse(req.url).pathname;
            console.log("Path", path, httpServer.listeners.length);
            if (path.charAt(path.length - 1) != "/")
                path = path + "/";
            if (path == '/' && req.method == 'GET') {
                console.log(`Special route: '${path}'`)
                for (var i = 0, len = listeners.length; i < len; ++i)
                    listeners[i].call(httpServer, req, resp);
                console.log("Response:",resp.statusCode)
            } else if (path.match(/^\/api\/|^\/ep\//)) { // add non jsdav paths here
                console.log(`Special route: '${path}'`)
                for (var i = 0, len = listeners.length; i < len; ++i)
                    listeners[i].call(httpServer, req, resp);
                console.log("Response:",resp.statusCode)
            } else {
                jsdavServer.exec(req, resp);
            }

        });
    }
}

module.exports= {
    start,
    models,
    tree
}
