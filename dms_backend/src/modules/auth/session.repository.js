// modules/auth/session.repository.js
import {db} from "../../config/database.js";

class SessionRepository {
  async findById(sessionId) {
    
    const query = `
      SELECT *
      FROM user_sessions
      WHERE session_id = ?
      LIMIT 1
    `;

    const [rows] = await db.execute(query, [sessionId]);
    return rows[0] || null;
  }

  async createSession(data) {
    const query = `
      INSERT INTO user_sessions (
        session_id,
        user_id,
        manufacturer_id,
        distributor_id,
        user_type,
        status,
        refresh_token,
        created_at,
        expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)
    `;

    const values = [
      data.sessionId,
      data.userId,
      data.manufacturerId,
      data.distributorId || null,
      data.userType,
      data.status || "ACTIVE",
      data.refreshToken,
      data.expiresAt
    ];

    await db.execute(query, values);
    return true;
  }

  async updateSessionStatus(sessionId, status) {
    const query = `
      UPDATE user_sessions
      SET status = ?
      WHERE session_id = ?
    `;

    await db.execute(query, [status, sessionId]);
    return true;
  }

  async expireSession(sessionId) {
    const query = `
      UPDATE user_sessions
      SET status = 'EXPIRED'
      WHERE session_id = ?
    `;

    await db.execute(query, [sessionId]);
    return true;
  }

  async revokeAllUserSessions(userId) {
    const query = `
      UPDATE user_sessions
      SET status = 'REVOKED'
      WHERE user_id = ?
    `;

    await db.execute(query, [userId]);
    return true;
  }
  async revokeAllSessions(userId) {

  await db.execute(
    `
    UPDATE user_sessions
    SET status='REVOKED'
    WHERE user_id=?
    AND status='ACTIVE'
    `,
    [userId]
  );

}
}

export default new SessionRepository();