require('dotenv').config();
const readline=require('node:readline/promises');
const {stdin:input,stdout:output}=require('node:process');
const bcrypt=require('bcryptjs');
const db=require('./config/database');

async function hiddenPassword(rl){
  if(!input.isTTY)return rl.question('Contraseña (mínimo 12 caracteres): ');
  output.write('Contraseña (mínimo 12 caracteres): ');
  input.setRawMode(true);input.resume();input.setEncoding('utf8');
  return new Promise((resolve,reject)=>{
    let value='';
    const finish=(err)=>{input.setRawMode(false);input.pause();input.removeListener('data',onData);output.write('\n');err?reject(err):resolve(value);};
    const onData=(key)=>{if(key==='\u0003')return finish(new Error('Operación cancelada'));if(key==='\r'||key==='\n')return finish();if(key==='\u007f'||key==='\b'){value=value.slice(0,-1);return;}value+=key;};
    input.on('data',onData);
  });
}

(async()=>{
  const rl=readline.createInterface({input,output});
  try{
    const nombre=(await rl.question('Nombre del administrador: ')).trim();
    const email=(await rl.question('Correo: ')).trim().toLowerCase();
    const password=await hiddenPassword(rl);
    if(!nombre||!/^\S+@\S+\.\S+$/.test(email)||password.length<12)throw Error('Datos inválidos o contraseña demasiado corta.');
    const hash=await bcrypt.hash(password,12);
    await db.execute('INSERT INTO usuarios (nombre,email,password_hash) VALUES (?,?,?)',[nombre,email,hash]);
    console.log('Administrador creado.');
  }catch(e){console.error(e.message);process.exitCode=1;}
  finally{rl.close();await db.end();}
})();
