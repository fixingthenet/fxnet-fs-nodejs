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

var IssuerCache= {}

var authBackend = jsDAVBasicAuth.extend({
    validateUserPass: async function(login, password, rawHeader){
//        console.log("validateUserPass:", login, password, rawHeader.substr(7), rawHeader.toLowerCase().indexOf("bearer") ,rawHeader)

        if (login == 'fxnet-idtoken') {
            return (await this.checkIdToken(password))
        } else if (rawHeader.toLowerCase().indexOf("bearer") == 0) {
            var jwt = rawHeader.substr(7)
            return (await this.checkIdToken(jwt))
        }

//        console.log("validateUserpass: fallback guest")
        return  {user: await models.User.findOne({where: {identifier: 'guest'}})}
    },

    async checkIdToken(jwtString) {
        var issuer = IssuerCache[appConfiguration.oidc_issuer]
        if (!issuer) {
            var issuer = await Issuer.discover(appConfiguration.oidc_issuer)
            IssuerCache[appConfiguration.oidc_issuer]=issuer
        }

        var keystore = await issuer.keystore()
        var decoded = jws.decode(jwtString)
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
