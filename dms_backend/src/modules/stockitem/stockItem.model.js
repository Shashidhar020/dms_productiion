import { db } from '../../config/database.js'
const normalizeName = (name) => name?.trim().toUpperCase();

const getStockItems = async (scope) => {
  const {
    manufacturerId,
    distributorId,
    userType,
    accessibleDistributorIds
  } = scope;

  let whereClause = '';
  let params = [];
  let stockWhereClause = '';


  // =========================
  // MANUFACTURER LOGIN
  // =========================
  if (userType === 'MANUFACTURER') {

    if (!accessibleDistributorIds || accessibleDistributorIds.length === 0) {
      return {
        totalStockValue: 0,
        totalStockSold: 0,
        products: []
      };
    }

    const placeholders = accessibleDistributorIds.map(() => '?').join(',');

    whereClause = `
      WHERE i.manufacturer_id = ?
    `;
    stockWhereClause = `
    WHERE sk.manufacturer_id = ?
    `;

    params = [manufacturerId];
  }

  // =========================
  // DISTRIBUTOR LOGIN
  // =========================
  else if (userType === 'DISTRIBUTOR') {

    whereClause = `
      WHERE i.manufacturer_id = ?
      AND i.distributor_id = ?
    `;
    stockWhereClause = `
    WHERE sk.manufacturer_id = ?
    AND sk.distributor_id = ?
    `;
    params = [manufacturerId, distributorId];
  }

  // =========================
  // INVALID USER TYPE SAFETY
  // =========================
  else {
    return {
      totalStockValue: 0,
      totalStockSold: 0,
      products: []
    };
  }

  // =========================
  // TOTAL STOCK SOLD
  // =========================
  const stockSoldSql = `
    SELECT 
      SUM(itm.quantity) AS stocksold
    FROM sales_items itm
    JOIN sales i 
      ON i.id = itm.sales_id
    ${whereClause}
    AND i.voucher_type = "Sales"
  `;

  // =========================
  // TOTAL STOCK VALUE
  // =========================
  const stockValueSql = `
    SELECT 
      SUM(itm.amount) AS totalStockValue
    FROM sales_items itm
    JOIN sales i 
      ON i.id = itm.sales_id
    ${whereClause}
    AND i.voucher_type = "Sales"
  `;

  const [[stockSold]] = await db.execute(stockSoldSql, params);

  const [[stocksvalue]] = await db.execute(stockValueSql, params);

  // =========================
  // PRODUCTS
  // =========================
  const productsSql = `
    SELECT 
      sk.id,
      sk.name,
      sk.stock_group,
      sk.category,
      sk.hsn_code,
      sk.product_code,
      sk.base_unit AS unit,
      sk.gst_taxability,
      sk.gst_rate,
      ROUND(sk.opening_balance, 2) AS openingBalance
 
    FROM stock_items sk
  
    LEFT JOIN stock_item_hsn sh
      ON sk.id = sh.stock_item_id
  ${stockWhereClause}
    ORDER BY sk.name ASC
  `;

  const [rows] = await db.query(productsSql, params);

  return {
    totalStockValue: stocksvalue.totalStockValue || 0,
    totalStockSold: stockSold.stocksold || 0,
    products: rows
  };
};
// export const bulkUpsertStockItemsMaster = async (conn, items, auth) => {
//   if (!items.length) return;
//   const manufacturerId = auth.manufacturerId
//   const distributorId = auth.distributorId
//   const values = items.map(i => {
//     const name = normalizeName(i.name);

//     return [
//       manufacturerId,
//       distributorId,
//       i.guid,
//       name,
//       i.parent || null,
//       i.category || null,
//       i.base_unit || null,
//       i.opening_qty || 0,
//       i.opening_rate || 0,
//       i.opening_value || 0,
//       i.is_batchwise ? 1 : 0,
//       1, // ✅ is_synced
//       0  // ✅ is_from_invoice
//     ];
//   });

//   await conn.query(`
//     INSERT INTO stock_items
//     (manufacturer_id, distributor_id,guid, name, parent, category, base_unit,
//      opening_balance, opening_rate, opening_value, is_batchwise,
//      is_synced, is_from_invoice)
//     VALUES ?
//     ON DUPLICATE KEY UPDATE
//       name = VALUES(name),
//       parent = VALUES(parent),
//       category = VALUES(category),
//       base_unit = VALUES(base_unit),
//       opening_balance = VALUES(opening_balance),
//       opening_rate = VALUES(opening_rate),
//       opening_value = VALUES(opening_value),
//       is_batchwise = VALUES(is_batchwise),
//       is_synced = 1,
//       is_from_invoice = 0
//   `, [values]);

//   // 🔥 Attach GUID to invoice-created items
//   for (const i of items) {
//     const name = normalizeName(i.name);
//     if (auth.userType === 'MANUFACTURER') {
//       await conn.query(`
//       UPDATE stock_items SET guid = ?, is_synced = 1, is_from_invoice = 0
//       WHERE name = ? and manufacturer_id = ?  AND guid IS NULL
//     `, [i.guid, name, manufacturerId]);
//     }
//     else {
//       await conn.query(`
//       UPDATE stock_items SET guid = ?, is_synced = 1, is_from_invoice = 0
//       WHERE name = ? and manufacturer_id = ? and distributor_id= ? AND guid IS NULL
//     `, [i.guid, name, manufacturerId, distributorId]);
//     }

//   }
// };

export const bulkUpsertStockItemsMaster = async (conn, items, auth) => {
  if (!items.length) return;

  const manufacturerId = auth.manufacturerId;
  const distributorId = auth.distributorId;

  for (const i of items) {
    const name = normalizeName(i.name);

    // 1. Update by GUID
    const [guidUpdate] = await conn.query(
      `UPDATE stock_items SET name=?, stock_group=?, category=?,
         base_unit=?, opening_balance=?, opening_rate=?, opening_value=?,
         is_batchwise=?, is_synced=1, is_from_invoice=0 WHERE guid=?`,
      [
        name, i.parent || null, i.category || null, i.base_unit || null,
        i.opening_qty || 0, i.opening_rate || 0, i.opening_value || 0,
        i.is_batchwise ? 1 : 0, i.guid]
    );

    if (guidUpdate.affectedRows > 0) continue;

    // 2. Update existing item by business key
    let updateResult;

    if (auth.userType === "MANUFACTURER") {
      [updateResult] = await conn.query(
        `UPDATE stock_items
         SET
           guid = IF(guid IS NULL, ?, guid),
           stock_group=?,
           category=?,
           base_unit=?,
           opening_balance=?,
           opening_rate=?,
           opening_value=?,
           is_batchwise=?,
           is_synced=1,
           is_from_invoice=0
         WHERE manufacturer_id=?
         AND distributor_id IS NULL
         AND name=?`,
        [
          i.guid,
          i.parent || null,
          i.category || null,
          i.base_unit || null,
          i.opening_qty || 0,
          i.opening_rate || 0,
          i.opening_value || 0,
          i.is_batchwise ? 1 : 0,
          manufacturerId,
          name
        ]
      );
    } else {
      [updateResult] = await conn.query(
        `UPDATE stock_items
         SET
           guid = IF(guid IS NULL, ?, guid),
           stock_group=?,
           category=?,
           base_unit=?,
           opening_balance=?,
           opening_rate=?,
           opening_value=?,
           is_batchwise=?,
           is_synced=1,
           is_from_invoice=0
         WHERE manufacturer_id=?
         AND distributor_id=?
         AND name=?`,
        [
          i.guid,
          i.parent || null,
          i.category || null,
          i.base_unit || null,
          i.opening_qty || 0,
          i.opening_rate || 0,
          i.opening_value || 0,
          i.is_batchwise ? 1 : 0,
          manufacturerId,
          distributorId,
          name
        ]
      );
    }

    if (updateResult.affectedRows > 0) continue;

    // 3. Insert new item
    await conn.query(
      `INSERT INTO stock_items
      (
        manufacturer_id,
        distributor_id,
        guid,
        name,
        stock_group,
        category,
        base_unit,
        opening_balance,
        opening_rate,
        opening_value,
        is_batchwise,
        is_synced,
        is_from_invoice
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        manufacturerId,
        distributorId,
        i.guid,
        name,
        i.parent || null,
        i.category || null,
        i.base_unit || null,
        i.opening_qty || 0,
        i.opening_rate || 0,
        i.opening_value || 0,
        i.is_batchwise ? 1 : 0,
        1,
        0
      ]
    );
  }
};
export const getStockIdMapByGuid = async (conn, items, auth) => {
  if (!items.length) return new Map();
  let dbRows;
  if (auth.userType === 'MANUFACTURER') {
    [dbRows] = await conn.query(
      `SELECT id, guid FROM stock_items WHERE guid IN (?) and manufacturer_id = ?`,
      [items.map(i => i.guid), auth.manufacturerId]
    );
    return new Map(dbRows.map(r => [r.guid, r.id]));
  }
  else {
    [dbRows] = await conn.query(
      `SELECT id, guid FROM stock_items WHERE guid IN (?) and manufacturer_id = ? and distributor_id=?`,
      [items.map(i => i.guid), auth.manufacturerId, auth.distributorId]
    );
    return new Map(dbRows.map(r => [r.guid, r.id]));
  }

};

export const insertChildTables = async (conn, idMap, items) => {
  const taxValues = [];
  const batchValues = [];
  const priceValues = [];

  for (const item of items) {
    const id = idMap.get(item.guid);
    if (!id) continue;

    // TAX
    taxValues.push([
      id,
      item.tax.cgst,
      item.tax.sgst,
      item.tax.igst,
      item.tax.hsn_code
    ]);

    // BATCH
    for (const b of item.batches || []) {
      batchValues.push([
        id,
        b.godown,
        b.batch_name,
        b.qty,
        b.rate
      ]);
    }

    // PRICE
    for (const p of item.prices || []) {
      priceValues.push([
        id,
        p.price_type,
        p.min_qty,
        p.max_qty,
        p.rate,
        p.discount
      ]);
    }
  }

  if (taxValues.length) {
    await conn.query(`
      INSERT INTO stock_item_tax
      (stock_item_id, cgst, sgst, igst, hsn_code)
      VALUES ?
    `, [taxValues]);
  }

  if (batchValues.length) {
    await conn.query(`
      INSERT INTO stock_batches
      (stock_item_id, godown, batch_name, qty, rate)
      VALUES ?
    `, [batchValues]);
  }

  if (priceValues.length) {
    await conn.query(`
      INSERT INTO stock_prices
      (stock_item_id, price_type, min_qty, max_qty, rate, discount)
      VALUES ?
    `, [priceValues]);
  }
};


export const refreshGST = async (conn, idMap, items) => {
  const stockIds = [...idMap.values()];
  if (!stockIds.length) return;

  // STEP 1: DELETE OLD GST + RATES (CRITICAL FIX)
  await conn.query(
    `DELETE FROM stock_item_gst_rates 
     WHERE gst_id IN (
       SELECT id FROM stock_item_gst WHERE stock_item_id IN (?)
     )`,
    [stockIds]
  );

  await conn.query(
    `DELETE FROM stock_item_gst WHERE stock_item_id IN (?)`,
    [stockIds]
  );
  function formatDBDate(date) {
    if (!date) return null;

    // Handles both Date object and string
    if (typeof date === "string") return date.slice(0, 10);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
  // STEP 2: INSERT GST MASTER
  const gstRows = [];

  for (const item of items) {
    const stockId = idMap.get(item.guid);
    if (!stockId) continue;

    for (const g of item.gstList || []) {
      gstRows.push([
        stockId,
        formatDBDate(g.applicable_from),
        g.taxability,
        g.source,
        g.is_reverse_charge,
        g.is_non_gst,
        g.is_ineligible_itc
      ]);
    }
  }

  if (gstRows.length) {
    await conn.query(`
      INSERT INTO stock_item_gst
      (stock_item_id, applicable_from, taxability, source,
       is_reverse_charge, is_non_gst, is_ineligible_itc)
      VALUES ?
    `, [gstRows]);
  }

  // STEP 3: FETCH NEW GST IDS
  const [gstRecords] = await conn.query(
    `SELECT id, stock_item_id, applicable_from 
     FROM stock_item_gst 
     WHERE stock_item_id IN (?)`,
    [stockIds]
  );

  const gstMap = new Map();

  for (const g of gstRecords) {
    gstMap.set(
      `${g.stock_item_id}_${formatDBDate(g.applicable_from)}`,
      g.id
    );
  }

  // STEP 4: INSERT RATES
  const rateRows = [];

  for (const item of items) {
    const stockId = idMap.get(item.guid);

    for (const g of item.gstList || []) {
      const gstId = gstMap.get(
        `${stockId}_${formatDBDate(g.applicable_from)}`
      );

      if (!gstId) continue;

      for (const r of g.rates || []) {
        rateRows.push([
          gstId,
          r.state_name,
          r.cgst,
          r.sgst,
          r.igst,
          r.cess
        ]);
      }
    }
  }

  if (rateRows.length) {
    await conn.query(`
      INSERT INTO stock_item_gst_rates
      (gst_id, state_name, cgst, sgst, igst, cess)
      VALUES ?
    `, [rateRows]);
  }
};



export const refreshHSN = async (conn, idMap, items) => {
  const stockIds = [...idMap.values()];
  if (!stockIds.length) return;
  // STEP 1: DELETE OLD HSN
  await conn.query(`DELETE FROM stock_item_hsn WHERE stock_item_id IN (?)`, [stockIds]);

  // STEP 2: INSERT NEW HSN
  const hsnRows = [];

  for (const item of items) {
    const stockId = idMap.get(item.guid);
    if (!stockId) continue;

    for (const h of item.hsnList || []) {
      hsnRows.push([
        stockId,
        h.applicable_from,
        h.hsn_code,
        h.source
      ]);
    }
  }

  if (hsnRows.length) {
    await conn.query(` INSERT INTO stock_item_hsn (stock_item_id, applicable_from, hsn_code, source) VALUES ?`, [hsnRows]);
  }
};
export const deleteChildData = async (conn, stockIds) => {
  if (!stockIds.length) return;
  await Promise.all([
    conn.query(`DELETE FROM stock_item_tax WHERE stock_item_id IN (?)`, [stockIds]),
    conn.query(`DELETE FROM stock_batches WHERE stock_item_id IN (?)`, [stockIds]),
    conn.query(`DELETE FROM stock_prices WHERE stock_item_id IN (?)`, [stockIds]),
    conn.query(`DELETE FROM stock_item_gst_rates  WHERE gst_id IN (SELECT id FROM stock_item_gst WHERE stock_item_id IN (?))`, [stockIds]),
    conn.query(`DELETE FROM stock_item_gst WHERE stock_item_id IN (?)`, [stockIds]),
    conn.query(`DELETE FROM stock_item_hsn WHERE stock_item_id IN (?)`, [stockIds]),
  ])
};
export default { getStockItems }

