import { db } from '../config/database.js';



export async function findApiKeyByKeyId(keyId) {
  const [rows] = await db.execute(
    `
      SELECT id, key_id, key_hash, name, company_id, user_id,
             rate_limit, is_active, expires_at, created_at, last_used_at
      FROM api_keys
      WHERE key_id = ?
      LIMIT 1
    `,
    [keyId]
  );

  return rows[0] || null;
}

export async function updateApiKeyLastUsed(id) {
  await db.execute(
    `UPDATE api_keys SET last_used_at = NOW() WHERE id = ?`,
    [id]
  );
}
