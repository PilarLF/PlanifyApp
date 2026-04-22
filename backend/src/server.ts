import app from './app';
import dotenv from 'dotenv';
import { pool } from './config/db';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function runMigrations() {
  try {
    await pool.query(`
      ALTER TABLE usuarios 
      ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0;
    `);
    console.log('Migración completada');
  } catch (err) {
    console.error('Error en migración:', err);
  }
}

async function main() {
  await runMigrations();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

main();