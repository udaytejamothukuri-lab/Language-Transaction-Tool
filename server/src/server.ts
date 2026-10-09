import { createApp } from './app';

const app = createApp();
const PORT = parseInt(process.env.PORT || '5000', 10);

const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` LinguaFlow Translation Backend Server`);
  console.log(` Running on: http://localhost:${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(` Translation API: http://localhost:${PORT}/api/translate`);
  console.log(`=========================================`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please terminate any process running on port ${PORT} or configure a different PORT in server/.env.`);
  } else {
    console.error('Server failed to start:', err.message);
  }
  process.exit(1);
});

export default server;
