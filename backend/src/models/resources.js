const db=require('../config/database');

const definitions={
  categorias:{table:'categorias',from:'categorias',id:'id',fields:['nombre','descripcion','orden','activo'],publicWhere:'activo=1',order:'orden,id',searchFields:['nombre','descripcion']},
  productos:{table:'productos',from:'productos p LEFT JOIN categorias c ON c.id=p.categoria_id',select:'p.*, c.nombre AS categoria_nombre',id:'p.id',fields:['categoria_id','nombre','descripcion','precio','imagen','disponible','destacado','ingredientes'],publicWhere:'p.disponible=1',order:'p.id DESC',searchFields:['p.nombre','p.descripcion','c.nombre']},
  servicios:{table:'servicios',from:'servicios',id:'id',fields:['nombre','descripcion','imagen','activo','orden'],publicWhere:'activo=1',order:'orden,id',searchFields:['nombre','descripcion']},
  especialidades:{table:'especialidades',from:'especialidades e LEFT JOIN productos p ON p.id=e.producto_id',select:'e.*, p.nombre AS producto_nombre',id:'e.id',fields:['producto_id','nombre','descripcion','imagen','activo','orden'],publicWhere:'e.activo=1',order:'e.orden,e.id',searchFields:['e.nombre','e.descripcion','p.nombre']},
  contenido:{table:'contenido_sitio',from:'contenido_sitio',id:'id',fields:['seccion','titulo','subtitulo','contenido','imagen','activo'],publicWhere:'activo=1',order:'id DESC',searchFields:['seccion','titulo','subtitulo','contenido']},
  galeria:{table:'galeria',from:'galeria',id:'id',fields:['titulo','descripcion','ruta_archivo','tipo','orden','activo'],publicWhere:'activo=1',order:'orden,id',searchFields:['titulo','descripcion']},
  preguntas:{table:'preguntas_frecuentes',from:'preguntas_frecuentes',id:'id',fields:['pregunta','respuesta','palabras_clave','categoria','activo'],publicWhere:'activo=1',order:'id DESC',searchFields:['pregunta','respuesta','palabras_clave']}
};

async function list(resource,publicOnly=true,{search='',page=1,limit=100}={}){
  const definition=definitions[resource],clauses=[],params=[];
  if(publicOnly)clauses.push(definition.publicWhere);
  if(search){clauses.push(`(${definition.searchFields.map(field=>`LOWER(COALESCE(${field},'')) LIKE ?`).join(' OR ')})`);for(let i=0;i<definition.searchFields.length;i++)params.push(`%${search.toLowerCase()}%`);}
  const where=clauses.length?` WHERE ${clauses.join(' AND ')}`:'';
  const offset=(page-1)*limit;
  const [rows]=await db.execute(`SELECT ${definition.select||'*'} FROM ${definition.from}${where} ORDER BY ${definition.order} LIMIT ? OFFSET ?`,[...params,limit,offset]);
  return rows;
}

async function get(resource,id){
  const definition=definitions[resource];
  const [rows]=await db.execute(`SELECT ${definition.select||'*'} FROM ${definition.from} WHERE ${definition.id}=?`,[id]);
  return rows[0];
}

async function create(resource,data){
  const definition=definitions[resource],keys=Object.keys(data).filter(key=>definition.fields.includes(key));
  if(!keys.length)throw Object.assign(new Error('No hay campos válidos'),{status:400});
  const [result]=await db.execute(`INSERT INTO ${definition.table} (${keys.join(',')}) VALUES (${keys.map(()=>'?').join(',')})`,keys.map(key=>data[key]));
  return get(resource,result.insertId);
}

async function update(resource,id,data){
  const definition=definitions[resource],keys=Object.keys(data).filter(key=>definition.fields.includes(key));
  if(!keys.length)throw Object.assign(new Error('No hay campos válidos'),{status:400});
  await db.execute(`UPDATE ${definition.table} SET ${keys.map(key=>`${key}=?`).join(',')} WHERE id=?`,[...keys.map(key=>data[key]),id]);
  return get(resource,id);
}

async function remove(resource,id){const [result]=await db.execute(`DELETE FROM ${definitions[resource].table} WHERE id=?`,[id]);return result.affectedRows>0;}
module.exports={tables:definitions,list,get,create,update,remove};
