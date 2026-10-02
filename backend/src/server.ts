import { app } from './app';
import { config } from './config';
import { initializeDatabase } from './db/data-source';

initializeDatabase()
  .then(() => {
    app.listen(config.port, () => console.log(`API listening on :${config.port}`));
  })
  .catch((err: unknown) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });
