const jwt=require('jsonwebtoken')
const jws = require('jws')
const jwktopem=require('jwk-to-pem')
const models = require('./models');
const { Issuer } = require('openid-client');

//const jose = require('node-jose');

// username and password via basic auth
// either real username and password
// or username: token and password: a "t\d+:"+ token of the singnIn

const IssuerCache= {}

const checkIdToken = async function(jwtString) {
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

module.exports = async function(req,res, next) {
//  console.log("authMiddleware:", req.headers.authorization)
  var token=req.headers.authorization.match(/Token token="(.*)"/)[1]
  try {
    var sc = await checkIdToken(token)
  } catch(e) {
    var sc = {user: await models.User.findOne({where: {identifier: 'guest'}})}
  }
  
  console.log("User:", sc.user.id, sc.user.identifier)
  req.securityContext = sc
  next()
};

