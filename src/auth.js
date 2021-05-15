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

const appConfiguration = {
  oidc_issuer: 'https://auth.dev.fixingthe.net',
  oidc_client: 'bc7bfb5df84e259d969ae7f8fbc7b7fe',
  oidc_scopes: 'openid',
}


var authBackend = jsDAVBasicAuth.extend({
    validateUserPass: async function(login, password){
      
      var session = {}
      var result = {}
      
      if (login == 'fxnet-idtoken') {
        var issuer = await Issuer.discover(appConfiguration.oidc_issuer)
        var keystore = await issuer.keystore()
        var decoded = jws.decode(password)
        var payload = jwt.verify(password,jwktopem(keystore.get(decoded.header.kid)),
          {
            algorithms: ['RS256'],
            ignoreExpiration: true,
          }
        ) // ignoreNotBefore ignoreExpiration clockTolreance audience issuer
          //maxAge
//        var client = issuer.Client
//        var result = await client.decryptIdToken(password)
        console.log("Issuer fxnet-idtoken:" ,issuer, keystore, decoded, payload)
        
        var oidc_provider = await models.OidcProvider.findOne({where: { issuer: payload.iss}})
        var user = await models.User.findOrCreate({where: { oidc_provider_id: oidc_provider.id, sub: payload.sub}})
      }
//        try {
//          var result =  await authAPI.login({
//              login: login,
//              password: password
//          })
//        } catch(e) {
//          result = { token: 'guest' }
//        }
        if (result.sessionLogin &&
            result.sessionLogin.errors) {
            //console.log("not authenticated: ",login,
            //            password, result)
            this.requireAuth('ups', "Authentication wrong");
        } else {
            //console.log("authenticated: ",login, result)
        }

        return result
    }
})
module.exports = authBackend;
