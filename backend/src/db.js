// backend/src/db.js
import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
import mysql from 'mysql2/promise';

const requiredEnv = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'PORT'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.warn(`[env] Missing ${key}. Ensure it is set in .env`);
  }
}

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
});

export async function testConnection() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
  } finally {
    conn.release();
  }
}


