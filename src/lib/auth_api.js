//import Axios from 'axios';
import graphql from  'graphql.js'
const API_API_URL = `${process.env.AUTH_API_URL}graphql`;

const authApi = function(token) {
  return graphql(API_API_URL, {
    method: "POST", // POST by default.
    asJSON: true,
    alwaysAutodeclare: true,
    headers: {
      "Access-Token": token
    },
    fragments: {
      // fragments, you don't need to say `fragment name`.
      //    auth: "on User { token }",
      errors: "on InputError { base fields{ name errors} }"
    }
  })
}

const q={
    login: function(vars) {
    var res=authApi(null).mutate(`
     sessionLogin(login: $login, password: $password) {
        token errors {...errors}}`)(vars)
    return res
  },
    changePassword: function(token,vars) {
    var res=authApi(token).mutate(`
     changePassword(login: $login,
                    currentPassword: $currentPassword,
                    newPassword: $newPassword,
                    newPasswordConfirmation: $newPasswordConfirmation
) {
        success errors {...errors}}`)(vars)
    return res
  },
    signup: function(token,vars) {
    var res=authApi(token).mutate(`
     signup(login: $login,
            password: $password
) {
        success  errors {...errors}}`)(vars)
    return res
  }
}
//, {}, }

export default q;
