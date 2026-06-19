import mysql from 'mysql2/promise';
import { env } from './env.js';
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const isDocker = process.env.RUNNING_IN_DOCKER === "true";

export const db = mysql.createPool({
  host: env.dbHost,
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  ssl: {
    ca: fs.readFileSync(path.join(__dirname, "ca.pem"))
  },
  port: env.dbPort,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function connectDatabase() {
  await db.query('SELECT 1');
  return db;
}




