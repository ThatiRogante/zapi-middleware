const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Webhook do n8n
const N8N_WEBHOOK_URL = 'https://n8n-n8n.he93v9.easypanel.host/webhook/330f9dd0-0f89-47d8-9d89-4a20b1f19a1e';

app.post('/zapi', async (req, res) => {
  const body = req.body;

  // Ignora grupos
  if (body.isGroup === true) {
    console.log('🔁 Mensagem de grupo ignorada');
    return res.status(200).send('Mensagem de grupo ignorada');
  }

  // Ignora reações
  if (body.reaction) {
    console.log('😊 Reação ignorada:', body.reaction.value);
    return res.status(200).send('Reação ignorada');
  }

  // Ignora figurinhas
  if (body.sticker) {
    console.log('�� Figurinha ignorada');
    return res.status(200).send('Figurinha ignorada');
  }

  const mensagem = body.body?.toLowerCase() || '';
  const fromMe = body.fromMe === true;

  // Se for a dona
  if (fromMe) {
    console.log('ℹ️ Mensagem da dona ignorada');
    return res.status(200).send('Mensagem da dona ignorada');
  }

  // Envia pro n8n
  try {
    await axios.post(N8N_WEBHOOK_URL, body);
    console.log('✅ Mensagem enviada ao n8n');
    res.status(200).send('Mensagem enviada');
  } catch (error) {
    console.error('❌ Erro ao enviar:', error.message);
    res.status(500).send('Erro ao enviar ao n8n');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Middleware rodando na porta ${PORT}`);
});


