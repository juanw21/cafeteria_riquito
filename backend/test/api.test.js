require('dotenv').config();
process.env.OLLAMA_ENABLED='false';
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const bcrypt=require('bcryptjs');
const app=require('../src/app');
const db=require('../src/config/database');

const marker=`test-${Date.now()}-${Math.random().toString(36).slice(2)}`;
let server,base,token,adminId,categoryId,productId,inactiveProductId,serviceId,faqId;
const call=(path,options={})=>fetch(`${base}/api${path}`,{...options,headers:{'content-type':'application/json',...(token?{authorization:`Bearer ${token}`}:{}) ,...(options.headers||{})}});
const json=(method,body)=>({method,body:JSON.stringify(body)});

before(async()=>{
  await db.query('SELECT 1');
  server=app.listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));
  base=`http://127.0.0.1:${server.address().port}`;
  const passwordHash=await bcrypt.hash('Testing-only-password-2026!',4);
  const [user]=await db.execute('INSERT INTO usuarios (nombre,email,password_hash) VALUES (?,?,?)',[marker,`${marker}@example.invalid`,passwordHash]);
  adminId=user.insertId;
  const login=await call('/auth/login',json('POST',{email:`${marker}@example.invalid`,password:'Testing-only-password-2026!'}));
  assert.equal(login.status,200);
  token=(await login.json()).token;
});

after(async()=>{
  if(productId)await db.execute('DELETE FROM productos WHERE id=?',[productId]);
  if(inactiveProductId)await db.execute('DELETE FROM productos WHERE id=?',[inactiveProductId]);
  if(categoryId)await db.execute('DELETE FROM categorias WHERE id=?',[categoryId]);
  if(serviceId)await db.execute('DELETE FROM servicios WHERE id=?',[serviceId]);
  if(faqId)await db.execute('DELETE FROM preguntas_frecuentes WHERE id=?',[faqId]);
  if(adminId)await db.execute('DELETE FROM usuarios WHERE id=?',[adminId]);
  if(server)await new Promise(resolve=>server.close(resolve));
  await db.end();
});

test('health confirma conexión a MySQL',async()=>{
  const res=await call('/health');assert.equal(res.status,200);assert.equal((await res.json()).status,'ok');
});

test('el perfil autenticado nunca incluye el hash de contraseña',async()=>{
  const response=await call('/auth/me');assert.equal(response.status,200);const body=await response.json();assert.equal(body.user.email,`${marker}@example.invalid`);assert.equal(Object.hasOwn(body.user,'password_hash'),false);
});

test('rechaza operaciones de administración sin token',async()=>{
  const res=await fetch(`${base}/api/categorias`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({nombre:marker})});assert.equal(res.status,401);
});

test('CRUD de categoría y producto valida precio y campos',async()=>{
  let res=await call('/categorias',json('POST',{nombre:marker,descripcion:'Registro temporal de prueba'}));assert.equal(res.status,201);categoryId=(await res.json()).data.id;
  res=await call('/productos',json('POST',{precio:1}));assert.equal(res.status,400);
  res=await call('/productos',json('POST',{nombre:marker,precio:-1,categoria_id:categoryId}));assert.equal(res.status,400);
  res=await call('/productos',json('POST',{nombre:marker,precio:3.75,categoria_id:categoryId,disponible:true}));assert.equal(res.status,201);productId=(await res.json()).data.id;
  res=await call(`/productos/${productId}`);assert.equal(res.status,200);const product=(await res.json()).data;assert.equal(Number(product.precio),3.75);assert.equal(product.categoria_nombre,marker);
  res=await call(`/productos/${productId}`,json('PUT',{precio:4.25}));assert.equal(res.status,200);assert.equal(Number((await res.json()).data.precio),4.25);
  res=await call(`/productos/${productId}`,{method:'DELETE'});assert.equal(res.status,204);productId=null;
  res=await call(`/categorias/${categoryId}`,json('PUT',{descripcion:'Descripción actualizada temporal'}));assert.equal(res.status,200);
  res=await call(`/categorias/${categoryId}`);assert.equal(res.status,200);
  res=await call(`/categorias/${categoryId}`,{method:'DELETE'});assert.equal(res.status,204);categoryId=null;
});

test('las consultas públicas ocultan productos no disponibles',async()=>{
  const inactive=await call('/productos',json('POST',{nombre:marker,precio:2,disponible:false}));assert.equal(inactive.status,201);inactiveProductId=(await inactive.json()).data.id;
  const rows=(await (await fetch(`${base}/api/productos`)).json()).data;assert.equal(rows.some(row=>row.id===inactiveProductId),false);
});

test('IDs inexistentes y rutas inexistentes devuelven 404; ID mal formado devuelve 400',async()=>{
  assert.equal((await call('/productos/99999999999')).status,404);
  assert.equal((await call('/productos/no-es-id')).status,400);
  assert.equal((await call('/ruta-desconocida')).status,404);
});

test('chatbot responde con registros encontrados y reconoce datos ausentes',async()=>{
  await db.execute('UPDATE productos SET disponible=1 WHERE id=?',[inactiveProductId]);
  const found=await call('/chatbot',json('POST',{message:`precio de ${marker}`}));assert.equal(found.status,200);const answer=await found.json();assert.equal(answer.hasInformation,true);assert.ok(answer.response.includes(marker));
  const missing=await call('/chatbot',json('POST',{message:'¿Cuál es el precio de un artículo que no existe con nombre qzxv987?' }));assert.equal(missing.status,200);assert.equal((await missing.json()).hasInformation,false);
  const empty=await call('/chatbot',json('POST',{message:'   '}));assert.equal(empty.status,400);
});

test('chatbot recupera servicios y preguntas frecuentes activos',async()=>{
  const [service]=await db.execute('INSERT INTO servicios (nombre,descripcion,activo) VALUES (?,?,1)',[marker,`Descripción temporal ${marker}`]);serviceId=service.insertId;
  const [faq]=await db.execute('INSERT INTO preguntas_frecuentes (pregunta,respuesta,palabras_clave,activo) VALUES (?,?,?,1)',[`Pregunta ${marker}`,`Respuesta temporal ${marker}`,marker]);faqId=faq.insertId;
  const serviceAnswer=await call('/chatbot',json('POST',{message:'¿Qué servicios ofrecen?'}));assert.equal((await serviceAnswer.json()).hasInformation,true);
  const faqAnswer=await call('/chatbot',json('POST',{message:`consulta ${marker}`}));assert.equal((await faqAnswer.json()).hasInformation,true);
});

test('captura centralizada de rutas inexistentes devuelve JSON',async()=>{
  const response=await call('/no-existe');assert.equal(response.headers.get('content-type').includes('application/json'),true);assert.equal(response.status,404);
  const malformed=await fetch(`${base}/api/contacto`,{method:'POST',headers:{'content-type':'application/json'},body:'{' });assert.equal(malformed.status,400);assert.match(malformed.headers.get('content-type'),/application\/json/);
});
