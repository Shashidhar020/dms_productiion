import { app } from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';

async function startServer() {
  try {
    await connectDatabase();
    console.log('Database connected');
    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Unable to start server', error.message);
    process.exit(1);
  }
}

startServer();
