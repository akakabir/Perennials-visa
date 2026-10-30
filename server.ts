import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
dotenv.config({ override: true });

// Import single-source handlers from /api
import chatHandler from './api/chat';
import healthHandler from './api/health';
import recoveryGenerateHandler from './api/recovery-code/generate';
import recoveryRedeemHandler from './api/recovery-code/redeem';
import adminVerifyHandler from './api/admin/verify';
import adminCreateHandler from './api/admin/create';
import adminUpdateHandler from './api/admin/update';
import adminDeleteHandler from './api/admin/delete';
import adminResolveHandler from './api/admin/resolve-identifier';

const app = express();
const PORT = 3000;

app.use(express.json());

// Express adapter for Vercel serverless handlers
const adapt = (handler: (req: any, res: any) => any) => (req: express.Request, res: express.Response) => {
  return handler(req, res);
};

// Mount API routes directly from /api handlers
app.all('/api/chat', adapt(chatHandler));
app.all('/api/health', adapt(healthHandler));
app.all('/api/recovery-code/generate', adapt(recoveryGenerateHandler));
app.all('/api/recovery-code/redeem', adapt(recoveryRedeemHandler));
app.all('/api/admin/verify', adapt(adminVerifyHandler));
app.all('/api/admin/create', adapt(adminCreateHandler));
app.all('/api/admin/update', adapt(adminUpdateHandler));
app.all('/api/admin/delete', adapt(adminDeleteHandler));
app.all('/api/admin/resolve-identifier', adapt(adminResolveHandler));

// [SERVER BOOTSTRAP] Start Express server and attach Vite middleware / SPA fallback
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
