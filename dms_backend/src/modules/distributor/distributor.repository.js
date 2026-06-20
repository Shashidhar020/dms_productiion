import crypto from "crypto";
import { db } from "../../config/database.js"
export class DistributorRepository {
  constructor(db) {
    this.db = db;
  }
  /**
   * Find Parent Distributor of existing Distributor */
  async findParentDistributor(connection, parentDistributorId, manufacturerId) {
    const [rows] = await connection.query(
      `
      SELECT id FROM distributors WHERE id = ? AND manufacturer_id = ?
      `,
      [parentDistributorId, manufacturerId]
    );

    return rows[0];
  }

  /**
 * Validate Permissions */
  async validatePermissions(connection, permissionIds) {
    if (!permissionIds.length) return [];

    const [rows] = await connection.query(
      `
      SELECT id
      FROM permissions
      WHERE id IN (?)
      `,
      [permissionIds]
    );

    return rows;
  }
  /** 
   *  Validate Permissions */
  async checkRoleExists(connection, manufacturerId, roleName) {
    const [rows] = await connection.query(
      `
      SELECT id
      FROM roles
      WHERE manufacturer_id = ?
      AND role_name = ?
      `,
      [manufacturerId, roleName]
    );

    return rows[0];
  }
  /**
   * Verify whether user Email is exist or not*/
  async checkUserEmail(connection, email) {
    const [rows] = await connection.query(
      `
      SELECT id
      FROM users
      WHERE email = ?
      `,
      [email]
    );

    return rows[0];
  }

  // INSERT DISTRIBUTOR WITHOUT distributor_code
  async createDistributor(connection, payload, manufacturerId, parentDid) {
    const [result] = await connection.query(
      `
      INSERT INTO distributors (
        manufacturer_id,
        parent_distributor_id,
        distributor_level,
        business_name,
        owner_name,
        gst_number,
        pan_number,
        email,
        mobile,
        address,
        state_name,
        city_name,
        pincode
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        manufacturerId,
        parentDid || null,
        parentDid ? "Sub-Distributor" : "Distributor",
        payload.business_name,
        payload.owner_name,
        payload.gst_number,
        payload.pan_number,
        payload.email,
        payload.mobile,
        payload.address,
        payload.state_name,
        payload.city_name,
        payload.pincode
      ]
    );

    return result.insertId;
  }

  // GENERATE DISTRIBUTOR CODE USING PRIMARY KEY ID
  async updateDistributorCode(connection, distributorId) {
    const distributorCode = `DST${String(distributorId).padStart(4, "0")}`;
    console.log(distributorCode)
    await connection.query(
      `
      UPDATE distributors
      SET distributor_code = ?
      WHERE id = ?
      `,
      [distributorCode, distributorId]
    );

    return distributorCode;
  }

  async createRole(connection, manufacturerId, roleName) {
    const [result] = await connection.query(
      `
      INSERT INTO roles (
        manufacturer_id,
        role_name,
        is_system_role
      )
      VALUES (?, ?, 0)
      `,
      [manufacturerId, roleName]
    );

    return result.insertId;
  }

  async mapRolePermissions(connection, roleId, permissionIds) {
    if (!permissionIds.length) return;

    const values = permissionIds.map((permissionId) => [roleId, permissionId]);

    await connection.query(
      `
      INSERT INTO role_permissions (role_id,permission_id) VALUES ?
      `,
      [values]
    );
  }

  async createUser(connection, userData) {
    const [result] = await connection.query(
      `
      INSERT INTO users (
        manufacturer_id,
        distributor_id,
        reporting_to_user_id,
        user_type,
        first_name,
        last_name,
        email,
        mobile,
        password_hash,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
      `,
      [
        userData.manufacturer_id,
        userData.distributor_id,
        userData.reporting_to_user_id,
        userData.user_type,
        userData.first_name,
        userData.last_name,
        userData.email,
        userData.mobile,
        userData.password_hash
      ]
    );

    return result.insertId;
  }

  async assignRoleToUser(connection, userId, roleId) {
    await connection.query(
      `
      INSERT INTO user_roles (user_id,role_id)
      VALUES (?, ?)
      `,
      [userId, roleId]
    );
  }

  async createApiKey(connection, manufacturerId, distributorId, userId, roleName) {
    const rawKey = `DMS_${crypto.randomBytes(32).toString("hex")}`
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

    await connection.query(
      `
      INSERT INTO api_keys (
        manufacturer_id,
        distributor_id,
        user_id,
        key_hash,
        key_name
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        manufacturerId,
        distributorId,
        userId,
        rawKey,
        `${roleName} API Key`
      ]
    );

    return rawKey;
  }


  static async saveOTP(payload, connection = db) {

    /**
     * DELETE OLD OTP
     */

    await connection.query(
      `
      DELETE FROM email_otps
      WHERE email = ?
      AND purpose = ?
      `,
      [
        payload.email,
        'DISTRIBUTOR_ONBOARD'
      ]
    );

    /**
     * INSERT NEW OTP
     */

    await connection.query(
      `
      INSERT INTO email_otps (
  
        email,
        otp,
        purpose,
        expires_at
  
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        payload.email,
        payload.otp,
        'DISTRIBUTOR_ONBOARD',
        payload.expires_at
      ]
    );

  }


  static async getLatestOTP(email, connection = db) {
    const [rows] = await connection.query(
      `
      SELECT *
      FROM email_otps
      WHERE email = ?
      AND purpose = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      [
        email,
        'DISTRIBUTOR_ONBOARD'
      ]
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

    await connection.query(
      `
      DELETE FROM email_otps
      WHERE email = ?
      AND purpose = ?
      `,
      [
        payload.email,
        'DISTRIBUTOR_ONBOARD'
      ]
    );

    /**
     * INSERT NEW OTP
     */

    await connection.query(
      `
      INSERT INTO email_otps (
  
        email,
        otp_hash,
        purpose,
        expires_at,
        attempts,
        is_verified
  
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        payload.email,
        payload.otp_hash,
        'DISTRIBUTOR_ONBOARD',
        payload.expires_at,
        0,
        0
      ]
    );

  }

  /**
   * GET VALID OTP
   */

  static async getValidOTP(email, connection = db) {

    const [rows] = await connection.query(
      `
      SELECT *
      FROM email_otps
      WHERE email = ?
      AND purpose = ?
      AND expires_at > NOW()
      AND is_verified = 0
      ORDER BY id DESC
      LIMIT 1
      `,
      [
        email,
        'DISTRIBUTOR_ONBOARD'
      ]
    );

    return rows[0];

  }

  /**
   * MARK OTP VERIFIED
   */

  static async markOTPVerified(id, connection = db) {

    await connection.query(
      `
      UPDATE email_otps
      SET
        is_verified = 1,
        verified_at = NOW()
      WHERE id = ?
      `,
      [id]
    );

  }

  /**
   * INCREMENT OTP ATTEMPTS
   */

  static async incrementOTPAttempts(id, connection = db) {

    await connection.query(
      `
      UPDATE email_otps
      SET attempts = attempts + 1
      WHERE id = ?
      `,
      [id]
    );

  }

  /**
   * DELETE OTP
   */

  static async deleteOTP(email, connection = db) {

    await connection.query(
      `
      DELETE FROM email_otps
      WHERE email = ?
      AND purpose = ?
      `,
      [
        email,
        'DISTRIBUTOR_ONBOARD'
      ]
    );

  }
  async checkDistributorGST(connection, gstNumber) {

    const [rows] = await connection.query(
      `
      SELECT id
      FROM distributors
      WHERE gst_number = ?
      LIMIT 1
      `,
      [gstNumber]
    );

    return rows[0];

  }

  async checkDistributorPAN(connection, panNumber) {

    const [rows] = await connection.query(
      `
      SELECT id
      FROM distributors
      WHERE pan_number = ?
      LIMIT 1
      `,
      [panNumber]
    );

    return rows[0];

  }

  async deleteById(distributorId, manufacturerId) {
    const [result] = await db.execute(
      `
    DELETE FROM distributors
    WHERE id = ?
    AND manufacturer_id = ?
    `,
      [distributorId, manufacturerId]
    );

    return result;
  }
}
