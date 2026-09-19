import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
// [API ROUTE] Handle sending emails via Resend
app.post('/api/send-email', async (req, res) => {
  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return res.status(500).json({ error: 'RESEND_API_KEY is not configured.' });
    }
    const resend = new Resend(resendKey);
    const { to, subject, html, from } = req.body;
    const data = await resend.emails.send({
      from: req.body.from || process.env.RESEND_FROM_EMAIL || 'Acme <onboarding@resend.dev>',
      to,
      subject,
      html
    });
    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to send email.' });
  }
});

// [API ROUTE] Health check endpoint for system status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'operational',
    services: {
      server: 'operational',
      ai_proxy: process.env.GROQ_API_KEY ? 'operational' : 'degraded'
    },
    timestamp: new Date().toISOString()
  });
});

// [API ROUTE] Chatbot AI proxy via Groq API
app.post('/api/chat', async (req, res) => {
  try {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return res.status(500).json({ error: 'GROQ_API_KEY is not configured on the server.' });
    }

    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages array.' });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
        messages
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      return res.status(response.status).json({ error: `Groq API Error: ${errorData}` });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error: any) {
    console.error('Groq Proxy Error:', error);
    res.status(500).json({ error: error.message || 'Failed to process request.' });
  }
});

// [SERVER BOOTSTRAP] Start Express server and attach Vite middleware/SPA fallback
async function startServer() {

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
