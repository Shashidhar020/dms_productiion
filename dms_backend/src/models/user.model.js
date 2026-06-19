import { db } from '../config/database.js';

export async function findUserByEmailAndCompany(email, companyId) {
  const [rows] = await db.execute(
    `
      SELECT
        users.id,
        users.company_id,
        users.role_id,
        users.name,
        users.email,
        users.password_hash,
        roles.code AS role
      FROM users
      INNER JOIN roles ON roles.id = users.role_id
      WHERE users.email = ? AND users.company_id = ?
      LIMIT 1
    `,
    [email, companyId]
  );
  return rows[0] || null;
}

export async function findUserByIdAndCompany(userId, companyId) {
  const [rows] = await db.execute(
    `
      SELECT
        users.id,
        users.company_id,
        users.role_id,
        users.name,
        users.email,
        roles.code AS role,
        roles.name AS role_name,
        users.created_at,
        users.updated_at
      FROM users
      INNER JOIN roles ON roles.id = users.role_id
      WHERE users.id = ? AND users.company_id = ?
      LIMIT 1
    `,
    [userId, companyId]
  );

  return rows[0] || null;
}

export async function findUsersByCompany(companyId) {
  const [rows] = await db.execute(
    `
      SELECT
        users.id,
        users.company_id,
        users.role_id,
        users.name,
        users.email,
        roles.code AS role,
        roles.name AS role_name,
        users.created_at,
        users.updated_at
      FROM users
      INNER JOIN roles ON roles.id = users.role_id
      WHERE users.company_id = ?
      ORDER BY users.created_at DESC
    `,
    [companyId]
  );

  return rows;
}

const createUser = async()=> {
  const connection = await db.getConnection()
  try {
  const user = await connection.beginTransaction()
  const insertuser =  `INSERT INTO users(name,email,password_hash) VALUES ('[value-1]','[value-2]','[value-3]','[value-4]','[value-5]','[value-6]')`
  

}
  catch (e) {

  }
}