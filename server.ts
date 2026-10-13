import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, ChildProcess } from 'child_process';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const FASTAPI_PORT = 8000;
const FASTAPI_HOST = '127.0.0.1';

let pythonProcess: ChildProcess | null = null;

function startFastAPIServer() {
  console.log('[EMS Server] Starting FastAPI Python backend process on port', FASTAPI_PORT);
  pythonProcess = spawn(
    'python3',
    ['-m', 'uvicorn', 'backend.main:app', '--port', String(FASTAPI_PORT), '--host', FASTAPI_HOST],
    {
      cwd: __dirname,
      stdio: ['ignore', 'inherit', 'inherit'],
      env: { ...process.env, PYTHONPATH: __dirname },
    }
  );

  pythonProcess.on('error', (err) => {
    console.error('[EMS Server] Failed to start FastAPI process:', err);
  });

  pythonProcess.on('exit', (code, signal) => {
    console.log(`[EMS Server] FastAPI process exited with code ${code} / signal ${signal}`);
  });
}

// Ensure Python process is cleaned up on server shutdown
function cleanup() {
  if (pythonProcess && !pythonProcess.killed) {
    console.log('[EMS Server] Terminating FastAPI child process...');
    pythonProcess.kill('SIGTERM');
  }
}
process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});
process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});
process.on('exit', () => {
  cleanup();
});

async function startServer() {
  startFastAPIServer();

  const app = express();

  // Proxy /api requests to FastAPI backend
  app.use('/api', (req: Request, res: Response) => {
    const targetUrl = `http://${FASTAPI_HOST}:${FASTAPI_PORT}${req.baseUrl}${req.url}`;
    
    const options: http.RequestOptions = {
      hostname: FASTAPI_HOST,
      port: FASTAPI_PORT,
      path: `${req.baseUrl}${req.url}`,
      method: req.method,
      headers: {
        ...req.headers,
        host: `${FASTAPI_HOST}:${FASTAPI_PORT}`,
      },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      console.warn('[EMS Proxy] FastAPI not yet ready or error:', err.message);
      if (!res.headersSent) {
        res.status(503).json({
          detail: 'FastAPI backend is initializing, please try again shortly.',
        });
      }
    });

    req.pipe(proxyReq, { end: true });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    console.log('[EMS Server] Mounting Vite dev server middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('[EMS Server] Serving production static files from dist/...');
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[EMS Server] Full-Stack application running on http://0.0.0.0:${PORT}`);
    console.log(`[EMS Server] FastAPI REST API proxied to http://${FASTAPI_HOST}:${FASTAPI_PORT}/api`);
  });
}

startServer().catch((err) => {
  console.error('[EMS Server] Fatal startup error:', err);
  cleanup();
  process.exit(1);
});
