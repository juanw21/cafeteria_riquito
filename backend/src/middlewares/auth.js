const jwt=require('jsonwebtoken');
function auth(req,res,next){const h=req.headers.authorization||''; try {if(!h.startsWith('Bearer ')) throw new Error(); req.user=jwt.verify(h.slice(7),process.env.JWT_SECRET); next();}catch{res.status(401).json({success:false,message:'Autenticación requerida'});}}
function optionalAuth(req,res,next){if(!req.headers.authorization)return next();return auth(req,res,next);}
module.exports=auth;module.exports.optionalAuth=optionalAuth;
