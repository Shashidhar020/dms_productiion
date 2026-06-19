import { db } from '../config/database.js';

export async function findRoleByCode(roleCode) {
  const [rows] = await db.execute(
    `
      SELECT id, code, name
      FROM roles
      WHERE code = ?
      LIMIT 1
    `,
    [roleCode]
  );

  return rows[0] || null;
}

export async function getAllRoles() {
  const [rows] = await db.execute(
    `
      SELECT id, code, name
      FROM roles
      ORDER BY id ASC
    `
  );

  return rows;
}
