
import { db } from "../../config/database.js";

class AuthRepository {

  async findUserByEmail(email) {
    const [rows] = await db.execute(`SELECT * FROM users WHERE email = ? LIMIT 1`, [email]);
    return rows[0];
  }

  async findUserById(userId) {
    const [rows] = await db.execute(`SELECT id, manufacturer_id, distributor_id, user_type, email, status
       FROM users WHERE id = ? LIMIT 1`, [userId]);
    return rows[0];
  }

  async createSession(data) {
    const query = `
      INSERT INTO user_sessions (session_id,user_id,manufacturer_id,distributor_id,refresh_token,
        ip_address,user_agent,status,expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
    `;

    const values = [
      data.sessionId, data.userId, data.manufacturerId,
      data.distributorId, data.refreshToken, data.ipAddress,
      data.userAgent, data.expiresAt,
    ];

    const [result] = await db.execute(query, values);
    return result.insertId;
  }

  async findSessionByRefreshToken(refreshToken) {
    const [rows] = await db.execute(
      `SELECT * FROM user_sessions WHERE refresh_token = ? AND status = 'ACTIVE'
       LIMIT 1`,
      [refreshToken]
    );
    return rows[0];
  }

  async findSessionById(sessionId) {
    const [rows] = await db.execute(
      `SELECT * FROM user_sessions WHERE session_id = ? LIMIT 1`,
      [sessionId]
    );
    return rows[0];
  }

  async revokeSession(refreshToken) {

    await db.execute(`UPDATE user_sessions SET status = 'REVOKED' WHERE refresh_token = ?`, [refreshToken]);
  }

  async findUserForEmailChange(userId) {
    const [rows] = await db.execute(`SELECT id, manufacturer_id,distributor_id,user_type,
    email,password_hash,status FROM users WHERE id = ? LIMIT 1`, [userId]);

    return rows[0];
  }
  async updateEmail(userId, newEmail) {
    await db.execute(`UPDATE users SET email=? WHERE id=? `, [newEmail, userId]);
  }
  async findUserForPasswordVerification(userId) {
    const [rows] = await db.execute(`SELECT id,password_hash,status FROM users WHERE id = ? LIMIT 1`, [userId]);
    return rows[0];
  }
  async findUserForPasswordChange(userId) {
    const [rows] = await db.execute(`SELECT id, manufacturer_id, distributor_id, user_type, email,  password_hash, status  FROM users WHERE id=? LIMIT 1`, [userId]);
    return rows[0];
  }
  async updatePassword(userId, passwordHash) {
    await db.execute(`UPDATE users SET password_hash=? WHERE id=? `, [passwordHash, userId]);
  }
  async getLatestOTP(email, connection = db) {
    const [rows] = await connection.query(`SELECT *  FROM email_otps WHERE email = ? AND purpose = ? ORDER BY id DESC LIMIT 1`,
      [email, 'MANUFACTURER_ONBOARD']);
    return rows[0];
  }

  /**
   * CREATE OTP
   */

  async createOTP(payload, connection = db) {

    /**
     * DELETE OLD OTP
     */

    await connection.query(`DELETE FROM email_otps WHERE email = ? AND purpose = ?`,
      [payload.email, 'MANUFACTURER_ONBOARD']
    );

    /**
     * INSERT NEW OTP
     */

    await connection.query(`INSERT INTO email_otps (email,otp_hash,purpose,expires_at,attempts,is_verified)
       VALUES (?, ?, ?, ?, ?, ?)
      `, [payload.email, payload.otp_hash, 'MANUFACTURER_ONBOARD', payload.expires_at, 0, 0]);

  }
  async createEmailChangeRequest(data) {
    await db.execute(`INSERT INTO email_change_requests (user_id, old_email, new_email, token, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `, [data.userId, data.oldEmail, data.newEmail, data.token, data.expiresAt]);
  }
  async findEmailChangeRequest(token) {
    const [rows] = await db.execute(`SELECT ecr.*,u.manufacturer_id,u.distributor_id,u.user_type 
        FROM email_change_requests ecr join users u on u.id= ecr.user_id WHERE token =? LIMIT 1;
  `, [token]);

    return rows[0];
  }
  async markEmailChangeVerified(token) {
    await db.execute(`UPDATE email_change_requests SET status = 'VERIFIED' WHERE token = ?`, [token]);
  }
  async expireEmailChange(token) {
    await db.execute(`UPDATE email_change_requests SET status = 'EXPIRED' WHERE token = ?`, [token]);
  }
  async revokeAllSessions(userId) {
    await db.execute(`UPDATE user_sessions SET status = 'REVOKED' WHERE user_id = ?`, [userId]);
  }
}

export default new AuthRepository();