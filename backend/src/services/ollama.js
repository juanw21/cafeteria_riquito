async function generateAnswer(question,records){
  if(process.env.OLLAMA_ENABLED==='false')return null;
  const endpoint=(process.env.OLLAMA_URL||'http://127.0.0.1:11434').replace(/\/$/,'');
  const model=process.env.OLLAMA_MODEL||'gemma3:4b';
  const context=JSON.stringify(records).slice(0,12000);
  try{
    const response=await fetch(`${endpoint}/api/chat`,{
      method:'POST',headers:{'content-type':'application/json'},
      body:JSON.stringify({model,stream:false,options:{temperature:0.1},messages:[
        {role:'system',content:'Eres un asistente de una cafetería. Contesta en español usando exclusivamente los registros JSON entregados como contexto. No inventes ni infieras productos, precios, horarios, direcciones, servicios ni políticas. Si el contexto no responde exactamente la pregunta, di que no tienes ese dato registrado. Mantén la respuesta breve.'},
        {role:'user',content:`Pregunta: ${question}\n\nContexto recuperado de MySQL (única fuente autorizada):\n${context}`}
      ]}),signal:AbortSignal.timeout(Number(process.env.OLLAMA_TIMEOUT_MS||30000))
    });
    if(!response.ok)throw new Error(`Ollama respondió HTTP ${response.status}`);
    const payload=await response.json(),answer=payload?.message?.content;
    return typeof answer==='string'&&answer.trim()?answer.trim():null;
  }catch(error){console.warn(`Ollama no disponible; se usa respuesta de MySQL: ${error.message}`);return null;}
}
module.exports={generateAnswer};
