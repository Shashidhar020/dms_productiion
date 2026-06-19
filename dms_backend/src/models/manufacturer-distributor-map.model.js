import { db } from '../config/database.js';

export async function findDistributorLinksByManufacturer(companyId) {
  const [rows] = await db.execute(
    `
      SELECT
        manufacturer_distributor_map.id,
        manufacturer_distributor_map.company_id,
        manufacturer_distributor_map.distributor_company_id,
        manufacturer_distributor_map.status,
        manufacturer_distributor_map.created_at,
        companies.name AS distributor_name,
        companies.company_code AS distributor_code
      FROM manufacturer_distributor_map
      INNER JOIN companies
        ON companies.id = manufacturer_distributor_map.distributor_company_id
      WHERE manufacturer_distributor_map.company_id = ?
      ORDER BY manufacturer_distributor_map.created_at DESC
    `,
    [companyId]
  );

  return rows;
}


export async function findDistributorLink(companyId, distributorCompanyId) {
  const [rows] = await db.execute(
    `
      SELECT id, company_id, distributor_company_id, status, created_at
      FROM manufacturer_distributor_map
      WHERE company_id = ? AND distributor_company_id = ?
      LIMIT 1
    `,
    [companyId, distributorCompanyId]
  );

  return rows[0] || null;
}

export async function createDistributorLink(companyId, distributorCompanyId) {
  const [result] = await db.execute(
    `
      INSERT INTO manufacturer_distributor_map (company_id, distributor_company_id, status)
      VALUES (?, ?, 'ACTIVE')
    `,
    [companyId, distributorCompanyId]
  );

  const [rows] = await db.execute(
    `
      SELECT id, company_id, distributor_company_id, status, created_at
      FROM manufacturer_distributor_map
      WHERE id = ?
      LIMIT 1
    `,
    [result.insertId]
  );

  return rows[0] || null;
}
