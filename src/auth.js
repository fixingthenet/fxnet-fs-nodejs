var jsDAVBasicAuth = require("jsDAV/lib/DAV/plugins/auth/abstractBasic");

var authBackend = jsDAVBasicAuth.extend({
    validateUserPass: function(username, password, cbvalidpass) {
        //console.log("authenticating: ",username,password)
        if (username=='peter') {
            cbvalidpass(true)
        } else {
            cbvalidpass(false)
        }
    },
})
export default authBackend;
