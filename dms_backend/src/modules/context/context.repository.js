// modules/context/context.repository.js

import {db} from "../../config/database.js";

class ContextRepository {

  async getDistributorById(distributorId, manufacturerId) {
    const [rows] = await db.execute(
      `
      SELECT
        id,
        manufacturer_id,
        parent_distributor_id,
        distributor_level,
        business_name,
        status
      FROM distributors
      WHERE id = ?
        AND manufacturer_id = ?
      LIMIT 1
      `,
      [distributorId, manufacturerId]
    );

    return rows[0] || null;
  }

  async getUserRoles(userId, manufacturerId) {
    const [rows] = await db.execute(
      `
      SELECT
        r.id,
        r.role_code,
        r.role_name
      FROM user_roles ur
      INNER JOIN roles r
        ON r.id = ur.role_id
      WHERE ur.user_id = ?
        AND r.manufacturer_id = ?
      `,
      [userId, manufacturerId]
    );

    return rows;
  }

  async getUserPermissions(userId, manufacturerId) {
    const [rows] = await db.execute(
      `
      SELECT DISTINCT
        p.permission_code
      FROM user_roles ur
      INNER JOIN roles r
        ON r.id = ur.role_id
      INNER JOIN role_permissions rp
        ON rp.role_id = r.id
      INNER JOIN permissions p
        ON p.id = rp.permission_id
      WHERE ur.user_id = ?
        AND r.manufacturer_id = ?
      `,
      [userId, manufacturerId]
    );

    return rows.map((row) => row.permission_code);
  }
}

export default new ContextRepository();