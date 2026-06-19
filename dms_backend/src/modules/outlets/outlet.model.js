
import { db } from '../../config/database.js'

const getOutlets = async (scope) => {
  const {manufacturerId, distributorId, userType, accessibleDistributorIds} = scope;
  

  let whereClause = '';
  let params = [];

  // =========================
  // MANUFACTURER LOGIN
  // =========================
  if (userType === 'MANUFACTURER') {
    if (!accessibleDistributorIds || accessibleDistributorIds.length === 0) {
      return [];
    }

    whereClause = `
    WHERE l.manufacturer_id = ?
  `;

    params = [manufacturerId];
  }
  // =========================
  // DISTRIBUTOR LOGIN
  // =========================
  else if (userType === 'DISTRIBUTOR') {
    whereClause = `
      WHERE l.manufacturer_id = ?
      AND l.distributor_id = ?
    `;
    params = [manufacturerId, distributorId];
  }

  // =========================
  // INVALID USER TYPE SAFETY
  // =========================
  else {
    return [];
  }

  const outletssql = `
    SELECT
      l.id,
      l.name,
      l.ledger_group,
      l.ledger_type,
      l.gstin,
      l.state,
      l.country,
      l.pincode,

      GROUP_CONCAT(
        DISTINCT ia.address_line
        SEPARATOR ', '
      ) AS full_address,

      SUM(le.amount) AS total_amount

    FROM ledgers l

    LEFT JOIN sales_ledger_entries le
      ON le.ledger_id = l.id

    LEFT JOIN sales_addresses ia
      ON ia.sales_id = le.sales_id

    ${whereClause}

    GROUP BY
      l.id,
      l.name,
      l.ledger_type,
      l.gstin,
      l.state,
      l.country,
      l.pincode

    HAVING SUM(le.is_party_ledger) > 0
  `;

  const [rows] = await db.query(outletssql, params);

  return rows;
};

export default { getOutlets };