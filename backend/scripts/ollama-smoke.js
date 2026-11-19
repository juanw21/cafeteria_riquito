require('dotenv').config();
const {generateAnswer}=require('../src/services/ollama');
(async()=>{
  process.env.OLLAMA_ENABLED='true';
  const answer=await generateAnswer('¿Cuál es el código de prueba?', [{pregunta:'Código de verificación temporal',respuesta:'El código temporal es 7319.'}]);
  if(!answer||!answer.includes('7319'))throw new Error('Gemma no devolvió el dato presente en el contexto.');
  console.log('Ollama/Gemma respondió usando el dato temporal proporcionado.');
})().catch(error=>{console.error(error.message);process.exitCode=1;});
