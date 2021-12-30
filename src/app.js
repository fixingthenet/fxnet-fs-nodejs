//middleware

const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const _ = require('lodash');

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
const authMiddleware = require('./authMiddleware');
const inodesTree = require('./tree');
const Backends = require('./backends');

var tree=inodesTree;

Backends.register(require('./backends/hashedLocal'));
Backends.register(require('./backends/justMeta'));
Backends.register(require('./backends/mirroredLocal'));

const uiTarget = process.env.UI_URL+'ui/'

const jsonParser = bodyParser.json( { type: (req) => { 
      console.log('headers:', req.headers['content-type'].match(/json/) )
      return req.headers['content-type'].match(/json/)
    }})
    
async function start(listen) {
    // Make sure the database tables are up to date
    //    await models.sequelize.authenticate();
    var options = {
        port: 3000,
    }

    app.use(logger('dev'))
    app.use(authMiddleware)
    
    
    // when adding something here don't forget to escape from the jdav servers below
    app.options('/ui', (req, res) => {
        console.log("Special ui options")
        res.end()
    })


    app.get('/api/v1/app_configurations/:id', async (req, res) => {
        console.log("Special app configurations", req.params)
        var AppConfigurationSerializer = new JSONAPISerializer('app_configurations', {
            attributes: ['configuration']
        });
        var appConfiguration = await models.AppConfiguration.findOne({where: { id: req.params.id }})
        var serialized = AppConfigurationSerializer.serialize(appConfiguration);
        res.send(JSON.stringify(serialized))
    })

    app.get('/api/v1/clients', async (req, res) => {
        console.log("Special clients")
        var clients = await models.Client.findAll({
          where: {
            user_id: 6
          },
          limit: 100,
          offset: 0,
        })
        
        var Serializer = new JSONAPISerializer('clients', {
            attributes: ['name','identifier','description','created_at', 'updated_at'],
            keyForAttribute: 'underscore_case',
        });
        var serialized = Serializer.serialize(clients);
        res.send(JSON.stringify(serialized))
    })

    app.get('/api/v1/clients/:id', async (req, res) => {
        console.log("Special clients")
        var client = await models.Client.findOne({
          where: {
            user_id: 6,
            id: req.params.id
          }
        })
        
        var Serializer = new JSONAPISerializer('clients', {
            attributes: ['name','identifier','description','created_at', 'updated_at'],
            keyForAttribute: 'underscore_case',
        });
        var serialized = Serializer.serialize(client);
        res.send(JSON.stringify(serialized))
    })

    app.patch('/api/v1/clients/:id',  jsonParser, async (req, res) => {
        console.log("Special clients", req.params.id)
        
        var client = await models.Client.findOne({
          where: {
            user_id: 6,
            id: req.params.id
          }
        })
        
        changedAttributes = []
        if (req.body && req.body.data && req.body.data.attributes) {
          changedAttributes = Object.keys(req.body.data.attributes)
          console.log("Changed attributes:", changedAttributes)
        }
        
        
        var Deserializer = new JSONAPIDeserializer('clients', {
            attributes: _.intersection(['name','description'],changedAttributes),
            keyForAttribute: 'underscore_case',
        });
        
        var deserialized = await Deserializer.deserialize(req.body);
        console.log("Deserialized:", deserialized)
        Object.keys(deserialized).forEach( (key) => {
          if (key == 'id') return
          client[key] = deserialized[key]
        })
        
        await client.save()

        var Serializer = new JSONAPISerializer('clients', {
            attributes: ['name','identifier','description','created_at', 'updated_at'],
            keyForAttribute: 'underscore_case',
        });
        var serialized = Serializer.serialize(client);
        res.send(JSON.stringify(serialized))
    })

    app.post('/api/v1/clients',  jsonParser, async (req, res) => {
        console.log("Special clients", req.params.id)
        
        var client = new models.Client
        
        changedAttributes = []
        if (req.body && req.body.data && req.body.data.attributes) {
          changedAttributes = Object.keys(req.body.data.attributes)
          console.log("Changed attributes:", changedAttributes)
        }
        
        
        var Deserializer = new JSONAPIDeserializer('clients', {
            attributes: _.intersection(['name','description'],changedAttributes),
            keyForAttribute: 'underscore_case',
        });
        
        var deserialized = await Deserializer.deserialize(req.body);
        console.log("Deserialized:", deserialized)
        Object.keys(deserialized).forEach( (key) => {
          if (key == 'id') return
          client[key] = deserialized[key]
        })
        
        client.user_id = 6
        
        await client.save()

        var Serializer = new JSONAPISerializer('clients', {
            attributes: ['name','identifier','description','created_at', 'updated_at'],
            keyForAttribute: 'underscore_case',
        });
        var serialized = Serializer.serialize(client);
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
            var path = Url.parse(req.url).pathname;
            console.log("Path", path, httpServer.listeners.length);
            if (path.charAt(path.length - 1) != "/")
                path = path + "/";
            if (path == '/' && req.method == 'GET') {    // the special path for root
                console.log(`Special route: '${path}'`)
                for (var i = 0, len = listeners.length; i < len; ++i)
                    listeners[i].call(httpServer, req, resp);
                console.log("Response Home:",resp.statusCode)
            } else if (path.match(/^\/api\/|^\/ep\//)) { // add non jsdav paths here
                console.log(`Special route: '${path}'`)
                for (var i = 0, len = listeners.length; i < len; ++i)
                   listeners[i].call(httpServer, req, resp);
                console.log("Response API:",resp.statusCode)
            } else {
                req.pause() //this is a strange hack 
                jsdavServer.exec(req, resp);
            }

        })
    }
}

module.exports= {
    start,
    models,
    tree
}
