require('dotenv').config();
const fs=require('node:fs');
const path=require('node:path');
const mysql=require('mysql2/promise');

(async()=>{
  const connection=await mysql.createConnection({host:process.env.DB_HOST,port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD,multipleStatements:true,charset:'utf8mb4'});
  try{
    const database=process.env.DB_NAME||'cafeteria_app_db';
    if(!/^[A-Za-z0-9_]+$/.test(database))throw new Error('DB_NAME solo puede contener letras, números y guion bajo.');
    const schema=fs.readFileSync(path.join(__dirname,'../database/schema.sql'),'utf8').replaceAll('cafeteria_app_db',database);
    await connection.query(schema);
    console.log('Esquema MySQL aplicado correctamente. No se insertaron datos comerciales.');
  }finally{await connection.end();}
})().catch(error=>{console.error('No se pudo aplicar el esquema:',error.message);process.exitCode=1;});
