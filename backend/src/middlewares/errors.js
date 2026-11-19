function notFound(req,res){res.status(404).json({success:false,message:'Ruta no encontrada'});}
function errorHandler(err,req,res,next){if(res.headersSent)return next(err); const status=err.status||500; if(status>=500) console.error(err); res.status(status).json({success:false,message:status>=500?'Error interno del servidor':err.message});}
module.exports={notFound,errorHandler};
