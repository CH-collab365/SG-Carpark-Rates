import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import carparksHandler from './api/carparks';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes go FIRST
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasLtaKey: Boolean(process.env.LTA_ACCOUNT_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // Serverless endpoint route handlers
  app.all('/api/carparks', carparksHandler);
  app.all('/api/carpark-availability', carparksHandler);
  app.all('/api', carparksHandler);

  // Vite middleware for development vs static build in production
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
