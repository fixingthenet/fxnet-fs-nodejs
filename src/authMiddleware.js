module.exports = function(req,res, next) {
  console.log("authMiddleware:", req.headers)    
  next()
};
