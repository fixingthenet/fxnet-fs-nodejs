import authAPI from './lib/auth_api'
import jsDAVBasicAuth from "jsDAV/lib/DAV/plugins/auth/abstractBasic";

// username and password via basic auth
// either real username and password
// or username: token and password: a "t\d+:"+ token of the singnIn

var authBackend = jsDAVBasicAuth.extend({
    validateUserPass: function(login, password, cb) {
        //console.log("authenticating: ",username,password)
        authAPI.login({login: login,
                       password: password})
            .then((result) => {
                if (result.sessionLogin.errors) {
                    console.log("AUTH RESULT SUCCESS:", result)
                    cb(false)
                } else {
                    console.log("AUTH RESULT FAIL:", result)
                    cb(true)
                }
            }).catch( (e) => {
                concole.log("AUTH ERROR:", e)
            })

    },
})
export default authBackend;
