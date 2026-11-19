const db=require('../config/database');
const {generateAnswer}=require('../services/ollama');
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

async function retrieve(message,q){
  let items=[],response='No encuentro esa información registrada. Si hay datos de contacto publicados, puedes usarlos para consultar directamente.';
  if(/precio|cuesta|costo|vale/.test(q)){
    const term=q.replace(/\b(cuanto|cuesta|precio|costo|vale|del|de|la|el|un|una|es)\b/g,' ').replace(/[¿?¡!,.:;]/g,' ').replace(/\s+/g,' ').trim();
    if(!term)return {items,response:'¿De qué producto quieres consultar el precio?'};
    const [rows]=await db.execute('SELECT nombre,descripcion,precio,disponible FROM productos WHERE disponible=1 AND LOWER(nombre) LIKE ? LIMIT 10',[`%${term}%`]);
    items=rows;if(rows.length)response=rows.map(x=>`${x.nombre}: ${Number(x.precio).toFixed(2)}`).join('. ');
  }else if(/producto|menu|ofrecen|venden|disponible/.test(q)){
    const [rows]=await db.query('SELECT nombre,descripcion,precio FROM productos WHERE disponible=1 ORDER BY nombre LIMIT 30');items=rows;if(rows.length)response=rows.map(x=>`${x.nombre}${x.descripcion?`: ${x.descripcion}`:''} (${Number(x.precio).toFixed(2)})`).join('. ');
  }else if(/categoria/.test(q)){
    const [rows]=await db.query('SELECT nombre,descripcion FROM categorias WHERE activo=1 ORDER BY orden');items=rows;if(rows.length)response=rows.map(x=>x.nombre).join(', ');
  }else if(/servicio/.test(q)){
    const [rows]=await db.query('SELECT nombre,descripcion FROM servicios WHERE activo=1 ORDER BY orden');items=rows;if(rows.length)response=rows.map(x=>`${x.nombre}${x.descripcion?`: ${x.descripcion}`:''}`).join('. ');
  }else if(/especialidad/.test(q)){
    const [rows]=await db.query('SELECT nombre,descripcion FROM especialidades WHERE activo=1 ORDER BY orden');items=rows;if(rows.length)response=rows.map(x=>`${x.nombre}${x.descripcion?`: ${x.descripcion}`:''}`).join('. ');
  }else if(/direccion|ubicacion|telefono|correo|email|horario|atienden|abren|cierran/.test(q)){
    const [rows]=await db.query('SELECT nombre_comercial,direccion,telefono,email,horario_atencion,ubicacion_mapa FROM configuracion_cafeteria WHERE id=1');const c=rows[0]||{},parts=[];
    if(/direccion|ubicacion/.test(q)&&c.direccion)parts.push(`Dirección: ${c.direccion}`);if(/ubicacion/.test(q)&&c.ubicacion_mapa)parts.push(`Mapa: ${c.ubicacion_mapa}`);if(/telefono/.test(q)&&c.telefono)parts.push(`Teléfono: ${c.telefono}`);if(/correo|email/.test(q)&&c.email)parts.push(`Correo: ${c.email}`);if(/horario|atienden|abren|cierran/.test(q)&&c.horario_atencion)parts.push(`Horario: ${c.horario_atencion}`);items=parts.length?[c]:[];if(parts.length)response=parts.join('. ');
  }else if(/nosotros|historia|quienes|cafeteria/.test(q)){
    const [rows]=await db.query('SELECT seccion,titulo,subtitulo,contenido FROM contenido_sitio WHERE activo=1');const [config]=await db.query('SELECT nombre_comercial FROM configuracion_cafeteria WHERE id=1');items=rows;if(rows.length)response=rows.map(x=>[x.titulo,x.subtitulo,x.contenido].filter(Boolean).join('. ')).join('\n');else if(config[0]?.nombre_comercial){items=config;response=config[0].nombre_comercial;}
  }else{
    const terms=q.split(/\s+/).filter(x=>x.length>3).slice(0,5);if(terms.length){const [rows]=await db.execute(`SELECT pregunta,respuesta FROM preguntas_frecuentes WHERE activo=1 AND (${terms.map(()=>'(LOWER(pregunta) LIKE ? OR LOWER(respuesta) LIKE ? OR LOWER(COALESCE(palabras_clave,"")) LIKE ?)').join(' OR ')}) LIMIT 5`,terms.flatMap(x=>[`%${x}%`,`%${x}%`,`%${x}%`]));items=rows;if(rows.length)response=rows.map(x=>x.respuesta).join(' ');}
  }
  return {items,response};
}

async function chat(req,res,next){
  try{
    const message=typeof req.body?.message==='string'?req.body.message.trim():'';
    if(!message||message.length>500)return res.status(400).json({success:false,message:'Escribe una consulta de hasta 500 caracteres'});
    const {items,response:fallback}=await retrieve(message,norm(message));
    if(!items.length)return res.json({success:true,response:fallback,source:'database',items,hasInformation:false});
    const generated=await generateAnswer(message,items);
    res.json({success:true,response:generated||fallback,source:generated?'ollama+database':'database',items,hasInformation:true});
  }catch(error){next(error);}
}
module.exports={chat,retrieve};
