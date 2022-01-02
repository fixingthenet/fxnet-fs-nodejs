const jsDAVBasicAuth = require('jsDAV/lib/DAV/plugins/auth/abstractBasic');
const jwt=require('jsonwebtoken')
const jws = require('jws')
const jwktopem=require('jwk-to-pem')
const models = require('./models');

const { Issuer } = require('openid-client');

//const jose = require('node-jose');

// username and password via basic auth
// either real username and password
// or username: token and password: a "t\d+:"+ token of the singnIn

var IssuerCache= {}

var authBackend = jsDAVBasicAuth.extend({
    validateUserPass: async function(login, password, rawHeader){
        try {
            if (login == 'fxnet-idtoken') {
                // either a "Basic <base64_encode(idtoken:jwt)>"
//                console.debug("Basic fxnet-idtoken", password)
                return (await this.checkIdToken(password))
            } else if (rawHeader.toLowerCase().indexOf("bearer") == 0) {
                // or a "Bearer <jwt>"
                var jwt = rawHeader.substr(7)
                return (await this.checkIdToken(jwt))
            } else {
                //then it should be legacy client stuff
                var client = await models.Client.findOne({
                  where: { identifier: login, secret: password}, 
                  include: [ { model: models.User, as: 'user' } ] 
                  })
//                 console.log("User found", login, password, client)
                if (client) {
                  return { user: client.user }
                } else {
                // falback to username:password and guest user is this fails
                // auth: user creates a legacy login pair (some key: some password)
                // for an app with a scope
                // console.log("validateUserpass: fallback guest")
                  return  {user: await models.User.findOne({where: {identifier: 'guest'}})}
                }
            }
        } catch(e) {
            console.log("Auth error", e)
            this.requireAuth('fxnet-fs')
            //throw(new AuthenticationError())
        }
    },

    async checkIdToken(jwtString) {
        var appConfigurationId=process.env.APP_CONFIGURATION_IDENTIFIER
        var appConfiguration = await models.AppConfiguration.findByPk(appConfigurationId)
        
        var issuer = IssuerCache[appConfiguration.configuration.oidc_issuer]
        if (!issuer) {
            var issuer = await Issuer.discover(appConfiguration.configuration.oidc_issuer)
            IssuerCache[appConfiguration.oidc_issuer]=issuer
        }

        var keystore = await issuer.keystore()
        var decoded = jws.decode(jwtString)
//        console.debug("decoded:", decoded)
        var payload = jwt.verify(jwtString,jwktopem(keystore.get(decoded.header.kid)),
                                 {
                                     algorithms: ['RS256'],
                                     ignoreExpiration: true,
                                 }
                                ) // ignoreNotBefore ignoreExpiration clockTolreance audience issuer
        //maxAge
        //      console.log("Issuer fxnet-idtoken:" ,issuer, keystore, decoded, payload, new Date(payload.iat*1000))

        var oidc_provider = await models.OidcProvider.findOne({where: { issuer: payload.iss}})
        var [user, created] = await models.User.findOrCreate({where: { oidc_provider_id: oidc_provider.id, sub: payload.sub}})

        return { user: user }

    }
})
module.exports = authBackend;
