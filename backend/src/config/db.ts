import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT)
});
pool.connect((err, _client, release) => {
  if (err) { console.error('Error al conectar con PostgreSQL:', err.message); return; }
  console.log('Conexión a PostgreSQL establecida correctamente.');
  release();
});
