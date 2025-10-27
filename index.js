const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Webhook do n8n
const N8N_WEBHOOK_URL = 'https://n8n-n8n.he93v9.easypanel.host/webhook/330f9dd0-0f89-47d8-9d89-4a20b1f19a1e';

// Fila de mensagens para evitar sobrecarga
let messageQueue = [];
let isProcessing = false;

// Função para processar fila
async function processQueue() {
  
  isProcessing = true;
  
  while (messageQueue.length > 0) {
    const body = messageQueue.shift();
    
    try {
      await axios.post(N8N_WEBHOOK_URL, body, { timeout: 10000 });
      console.log('✅ Mensagem enviada ao n8n');
    } catch (error) {
      console.error('❌ Erro ao enviar:', error.message);
      messageQueue.unshift(body);
      break;
    }
  }
  
  isProcessing = false;
}

// Função para validar se é mensagem válida
function isValidMessage(body) {
  if (body.isGroup === true) {
    console.log('🔁 Mensagem de grupo ignorada');
    return false;
  }

  if (body.reaction) {
    console.log('😊 Reação ignorada:', body.reaction.value);
    return false;
  }

  if (body.sticker) {
    console.log('🎨 Figurinha ignorada');
    return false;
  }

  if (body.fromMe === true) {
    console.log('ℹ️ Mensagem da dona ignorada');
    return false;
  }

    console.log('⚠️ Mensagem vazia ignorada');
    return false;
  }

  return true;
}

app.post('/zapi', async (req, res) => {
  const body = req.body;

  if (!isValidMessage(body)) {
    return res.status(200).send('Mensagem filtrada');
  }

  messageQueue.push(body);
  console.log(`📨 Mensagem adicionada à fila. Total na fila: ${messageQueue.length}`);

  processQueue();

  res.status(200).send('Mensagem recebida');
});

app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    filaSize: messageQueue.length,
    processando: isProcessing
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Middleware rodando na porta ${PORT}`);
});
