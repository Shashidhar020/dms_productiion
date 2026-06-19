import {db} from "../../config/database.js";

class HierarchyRepository {
  async getDistributorById(distributorId) {
    const [rows] = await db.query(
      `
      SELECT
        id,
        manufacturer_id,
        parent_distributor_id
      FROM distributors
      WHERE id = ?
      LIMIT 1
      `,
      [distributorId]
    );

    return rows[0] || null;
  }

  async getChildDistributors(
    manufacturerId,
    parentDistributorId
  ) {
    const [rows] = await db.query(
      `
      SELECT id
      FROM distributors
      WHERE manufacturer_id = ?
      AND parent_distributor_id = ?
      `,
      [manufacturerId, parentDistributorId]
    );

    return rows;
  }

  async getAllManufacturerDistributors(
    manufacturerId
  ) {
    const [rows] = await db.query(
      `
      SELECT id
      FROM distributors
      WHERE manufacturer_id = ?
      `,
      [manufacturerId]
    );

    return rows;
  }
}

export default new HierarchyRepository();

