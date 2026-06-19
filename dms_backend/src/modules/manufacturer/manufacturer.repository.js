import crypto from 'crypto';
import { db } from '../../config/database.js';

export class ManufacturerRepository {

  static async findManufacturerByCode(manufacturerCode, connection = db) {
    const [rows] = await connection.query(`SELECT id FROM manufacturers WHERE manufacturer_code = ? LIMIT 1`,
      [manufacturerCode]);
    return rows[0];
  }

  static async findUserByEmail(email, connection = db) {
    const [rows] = await connection.query(`SELECT id FROM users WHERE email = ? LIMIT 1`, [email]);
    return rows[0];
  }

  static async createManufacturer(payload, connection = db) {
    // Step 1: Insert manufacturer without manufacturer_code
    const [result] = await connection.query(`INSERT INTO manufacturers (company_name,gst_number,pan_number,email,mobile,address,status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [payload.company_name, payload.gst_number, payload.pan_number, payload.email,
      payload.mobile, payload.address, 'ACTIVE']);

    // Step 2: Get generated auto increment ID
    const manufacturerId = result.insertId;

    // Step 3: Generate manufacturer code
    const manufacturerCode = `MFG${String(manufacturerId).padStart(6, '0')}`;

    // Step 4: Update manufacturer_code
    await connection.query(`UPDATE manufacturers SET manufacturer_code = ? WHERE id = ?`,
      [manufacturerCode, manufacturerId]
    );

    // Step 5: Return complete data
    return result.insertId;
  }
  static async createRole(manufacturerId, connection = db) {
    const [result] = await connection.query(
      `
      INSERT INTO roles (manufacturer_id,role_name,is_system_role) VALUES (?, ?, ?)
      `,
      [manufacturerId, 'Manufacturer Admin', 1]
    );

    return result.insertId;
  }

  static async getRole(manufacturerId, connection = db) {
    const [rows] = await connection.query(
      `
      SELECT id  FROM roles WHERE manufacturer_id = ? AND role_code = 'MANUFACTURER_ADMIN' LIMIT 1`,
      [manufacturerId]);

    return rows[0];
  }

  static async createUser(payload, connection = db) {
    const [result] = await connection.query(
      `
      INSERT INTO users (manufacturer_id,user_type,employee_code,first_name,last_name,email,mobile,password_hash,
        is_super_admin,status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [payload.manufacturer_id, 'MANUFACTURER', payload.employee_code, payload.first_name,
      payload.last_name, payload.email, payload.mobile, payload.password_hash, 1, 'ACTIVE']
    );

    return result.insertId;
  }

  static async assignRole(userId, roleId, connection = db) {
    await connection.query(
      ` INSERT INTO user_roles (user_id,role_id) VALUES (?, ?)
      `,
      [userId, roleId]
    );
  }

  static async createApiKey(payload, connection = db) {
    const keyHash = crypto.createHash('sha256').update(payload.api_key).digest('hex');

    await connection.query(
      `INSERT INTO api_keys (manufacturer_id,user_id,key_hash,key_name,status)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        payload.manufacturer_id, payload.user_id, payload.api_key, payload.key_name, 'ACTIVE'
      ]
    );
  }

  static async getDistributor(payload, connection = db) {
    if (payload.userType === "MANUFACTURER") {
      const rows = await connection.query(`select d.business_name as company_name,d.owner_name,d.gst_number,d.email as company_email,d.address as company_address,d.state_name,d.city_name,d.pan_number,d.pincode,d.mobile as company_mobile,u.first_name,u.last_name,u.email as user_email,u.mobile as user_mobile,d.created_at,d.updated_at
         from distributors d join users u on d.id = u.distributor_id where d.manufacturer_id=?`, [payload.manufacturerId])
      return rows[0]
    }
    else return null

  }
  /**
 * SAVE OTP
 */

  static async saveOTP(payload, connection = db) {

    /**
     * DELETE OLD OTP
     */

    await connection.query(` DELETE FROM email_otps WHERE email = ? AND purpose = ?`,
      [payload.email, 'MANUFACTURER_ONBOARD']);

    /**
     * INSERT NEW OTP
     */

    await connection.query(`INSERT INTO email_otps (email,otp,purpose,expires_at) VALUES (?, ?, ?, ?)`,
      [payload.email, payload.otp, 'MANUFACTURER_ONBOARD', payload.expires_at]
    );

  }


  static async getLatestOTP(email, connection = db) {
    const [rows] = await connection.query(`SELECT * FROM email_otps WHERE email = ? AND purpose = ? ORDER BY id DESC LIMIT 1`,
      [email, 'MANUFACTURER_ONBOARD']
    );
    return rows[0];
  }

  /**
   * CREATE OTP
   */

  static async createOTP(payload, connection = db) {

    /**
     * DELETE OLD OTP
     */

    await connection.query(`DELETE FROM email_otps WHERE email = ? AND purpose = ?`,
      [payload.email, 'MANUFACTURER_ONBOARD']
    );

    /**
     * INSERT NEW OTP
     */

    await connection.query(`INSERT INTO email_otps (email,otp_hash,purpose,expires_at,attempts,is_verified) VALUES (?, ?, ?, ?, ?, ?)`,
      [payload.email, payload.otp_hash, 'MANUFACTURER_ONBOARD', payload.expires_at, 0, 0]);

  }

  /**
   * GET VALID OTP
   */

  static async getValidOTP(email, connection = db) {

    const [rows] = await connection.query(`SELECT * FROM email_otps  WHERE email = ? AND purpose = ? AND expires_at > NOW()
    AND is_verified = 0 ORDER BY id DESC  LIMIT 1`, [email, 'MANUFACTURER_ONBOARD']);

    return rows[0];

  }

  /**
   * MARK OTP VERIFIED
   */

  static async markOTPVerified(id, connection = db) {

    await connection.query(`UPDATE email_otps SET is_verified = 1, verified_at = NOW() WHERE id = ?`, [id]);

  }

  /**
   * INCREMENT OTP ATTEMPTS
   */

  static async incrementOTPAttempts(id, connection = db) {

    await connection.query(`UPDATE email_otps SET attempts = attempts + 1 WHERE id = ?`, [id]);

  }

  /**
   * DELETE OTP
   */

  static async deleteOTP(email, connection = db) {

    await connection.query(`DELETE FROM email_otps WHERE email = ? AND purpose = ?`,
      [email, 'MANUFACTURER_ONBOARD']);

  }
}
