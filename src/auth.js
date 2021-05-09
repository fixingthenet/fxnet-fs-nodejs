const jsDAVBasicAuth = require('jsDAV/lib/DAV/plugins/auth/abstractBasic');
// username and password via basic auth
// either real username and password
// or username: token and password: a "t\d+:"+ token of the singnIn

var authBackend = jsDAVBasicAuth.extend({
    validateUserPass: async function(login, password){
//        try {
//          var result =  await authAPI.login({
//              login: login,
//              password: password
//          })
//        } catch(e) {
          result = { token: 'guest' }
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
