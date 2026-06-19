import { db } from '../../config/database.js';

const normalizeName = (name) => String(name || "").trim().toUpperCase();

export const insertVouchersBulk = (conn, rows) => {

  return conn.query(
    `INSERT INTO vouchers 
    (manufacturer_id , 
    distributor_id,uuid, guid, voucher_number, voucher_type, voucher_date, effective_date,
     party_name, party_ledger_name, party_gstin, company_gstin,
     place_of_supply, state_name, cmpstate,	consigneestate,narration, sub_total, total_amount, created_by)
    VALUES ?
    ON DUPLICATE KEY UPDATE 
      voucher_number = VALUES(voucher_number),
      voucher_type = VALUES(voucher_type),
      voucher_date = VALUES(voucher_date),
      effective_date = VALUES(effective_date),
      party_name = VALUES(party_name),
      party_ledger_name = VALUES(party_ledger_name),
      party_gstin = VALUES(party_gstin),
      company_gstin = VALUES(company_gstin),
      place_of_supply = VALUES(place_of_supply),
      state_name = VALUES(state_name),
      cmpstate = VALUES(cmpstate),
      consigneestate = VALUES(consigneestate),
      narration = VALUES(narration),
      sub_total = VALUES(sub_total),
      total_amount = VALUES(total_amount),
      updated_at = CURRENT_TIMESTAMP`,
    [rows]
  );
};

export const insertPartiesBulk = (conn, rows) => {

  return conn.query(
    `INSERT INTO  voucher_parties
    (voucher_id, party_type, name, mailing_name, gstin,
     gst_registration_type, state, country, pincode, pan_number, base_name)
    VALUES ?`,
    [rows]
  );
};


export const insertAddressesBulk = (conn, rows) => {

  return conn.query(
    `INSERT INTO voucher_addresses
    (voucher_id, address_type, line_number, address_line)
    VALUES ?`,
    [rows]
  );
};

export const insertGSTBulk = (conn, rows) => {
  return conn.query(
    `INSERT INTO voucher_gst_details
    (voucher_id, registration_name, tax_type, gstin, state)
    VALUES ?`,
    [rows]
  );
};

export const insertItemsBulk = (conn, rows) => {

  return conn.query(
    `INSERT INTO purchase_items
    (uuid, voucher_id, stock_item_id, stock_item_name,product_code,
     hsn_code, quantity, unit, rate,discount, amount, billedqty,mrp_rate,inclvatrate,gst_rate)
    VALUES ?`,
    [rows]
  );
};

export const insertBatchBulk = (conn, rows) => {
  return conn.query(
    `INSERT INTO pch_itm_bch_allocations
    (item_uuid,order_no, godown_name, batch_name, quantity, rate, amount)
    VALUES ?`,
    [rows]
  );
};

export const insertLedgerEntriesBulk = (conn, rows) => {
  return conn.query(
    `INSERT INTO voucher_ledger_entries
    (voucher_id, ledger_id, ledger_name, amount, entry_type, is_party_ledger)
    VALUES ?`,
    [rows]
  );
};

export const insertCostCentresBulk = (conn, rows) => {

  return conn.query(
    `INSERT INTO voucher_cost_centre_allocations	
    (voucher_id, ledger_name, category, cost_centre_name, amount)
    VALUES ?`,
    [rows]
  );
};

export const insertBillAllocationsBulk = (conn, rows) => {
  return conn.query(
    `INSERT INTO voucher_bill_allocations
    (voucher_id, ledger_name, bill_name, bill_type, credit_period, amount)
    VALUES ?`,
    [rows]
  );
};

export const bulkUpsertStockItems = async (conn, map, auth) => {
  const rows = Array.from(map.values());
  if (!rows.length) return new Map();
  await conn.query(
    `INSERT INTO stock_items
    (manufacturer_id, distributor_id,name,stock_group,category,  product_code, hsn_code, base_unit, gst_taxability, gst_rate, is_from_invoice, is_synced)
    VALUES ?
    ON DUPLICATE KEY UPDATE
      stock_group = CASE WHEN is_synced = FALSE THEN VALUES(stock_group) ELSE stock_group END,
      category = CASE WHEN is_synced = FALSE THEN VALUES(category) ELSE category END,
      product_code =CASE WHEN is_synced=FALSE THEN VALUES(product_code) ELSE product_code END,
      hsn_code = CASE 
        WHEN is_synced = FALSE THEN VALUES(hsn_code) 
        ELSE hsn_code 
      END,
      base_unit = CASE 
        WHEN is_synced = FALSE THEN VALUES(base_unit) 
        ELSE base_unit 
      END,
      gst_taxability = CASE 
        WHEN is_synced = FALSE THEN VALUES(gst_taxability) 
        ELSE gst_taxability 
      END,
      gst_rate = CASE 
        WHEN is_synced = FALSE THEN VALUES(gst_rate) 
        ELSE gst_rate 
      END`,
    [
      rows.map(i => [
        i.mid,
        i.did,
        i.name,
        i.stk_group,
        i.category,
        i.product_code,
        i.hsn || null,
        i.unit || null,
        i.taxability || 'Taxable',
        i.taxRate || 0,
        true,   // from invoice
        false   // not synced
      ])
    ]
  );
  let dbRows;
  if (auth.userType === 'MANUFACTURER') {
    [dbRows] = await conn.query(
      `SELECT id, name FROM stock_items WHERE name IN (?) and manufacturer_id = ?`,
      [rows.map(i => i.name), auth.manufacturerId]
    );
    return new Map(dbRows.map(r => [normalizeName(r.name), r.id]));
  }
  else {
    [dbRows] = await conn.query(
      `SELECT id, name FROM stock_items WHERE name IN (?) and manufacturer_id = ? and distributor_id=?`,
      [rows.map(i => i.name), auth.manufacturerId, auth.distributorId]
    );
    return new Map(dbRows.map(r => [normalizeName(r.name), r.id]));
  }
};
export const bulkUpsertLedgers = async (conn, map, auth) => {
  const rows = Array.from(map.values());
  if (!rows.length) return new Map();

  await conn.query(
    `INSERT INTO ledgers
    (manufacturer_id, distributor_id,name,ledger_group, ledger_type, gstin, state, country, pincode)
    VALUES ?
    ON DUPLICATE KEY UPDATE
      ledger_group = VALUES(ledger_group),
      ledger_type = VALUES(ledger_type),
      gstin = VALUES(gstin),
      state = VALUES(state),
      country = VALUES(country),
      pincode = VALUES(pincode)`,
    [rows.map(l => [
      l.mid,
      l.did,
      l.name,
      l.group,
      l.type,
      l.gstno,
      l.state,
      l.country,
      l.pincode
    ])]
  );

  let dbRows;
  if (auth.userType === 'MANUFACTURER') {
    [dbRows] = await conn.query(
      `SELECT id, name FROM ledgers  WHERE name IN (?) and manufacturer_id = ?`,
      [rows.map(i => i.name), auth.manufacturerId]
    );
    return new Map(dbRows.map(r => [normalizeName(r.name), r.id]));
  }
  else {
    [dbRows] = await conn.query(
      `SELECT id, name FROM ledgers WHERE name IN (?) and manufacturer_id = ? and distributor_id=?`,
      [rows.map(i => i.name), auth.manufacturerId, auth.distributorId]
    );
    return new Map(dbRows.map(r => [normalizeName(r.name), r.id]));
  }
};


export const getFlatPurchaseOrders = async (scope) => {

  const { manufacturerId, distributorId, userType, accessibleDistributorIds } = scope;

  const conn = await db.getConnection();

  try {

    let whereClause = '';
    let params = [];

    // =========================
    // MANUFACTURER LOGIN
    // =========================
    if (userType === 'MANUFACTURER') {


      whereClause = `
        WHERE i.manufacturer_id = ?
  
        AND i.voucher_type = "Purchase Order"
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
        AND i.voucher_type = "Purchase Order"
      `;

      params = [manufacturerId, distributorId];
    }

    // =========================
    // INVALID USER TYPE SAFETY
    // =========================
    else {
      return [];
    }

    const newFlatSql = `
      SELECT
    i.uuid AS voucher_id,
    i.voucher_number,
    i.voucher_date,
    i.party_name,
    i.total_amount,
    i.place_of_supply,
    i.state_name,
    i.cmpstate,
    i.consigneestate,

    itm.stock_item_name,
    sk.stock_group,
    sk.category,

    le.ledger_group,

    itm.product_code,
    itm.hsn_code,
    itm.quantity,
    itm.unit,
    itm.rate,
    itm.inclvatrate,
    itm.discount,
    itm.amount,
    itm.gst_rate AS gstRate,

    ROUND(itm.amount * itm.gst_rate / 100, 2) AS gstAmount,

    buyer.name AS buyer_name,
    buyer.gstin AS buyer_gstin,

    consignee.name AS consignee_name,

    le.ledgers,
    le.total_ledger_amount,

    gst.gst_types

    FROM vouchers i

    LEFT JOIN purchase_items itm
     ON itm.voucher_id = i.id

    LEFT JOIN stock_items sk
     ON sk.id = itm.stock_item_id

    LEFT JOIN voucher_parties buyer
      ON buyer.voucher_id = i.id
      AND buyer.party_type = 'BUYER'

    LEFT JOIN voucher_parties consignee
      ON consignee.voucher_id = i.id
      AND consignee.party_type = 'CONSIGNEE'

    LEFT JOIN (SELECT vle.voucher_id,
        GROUP_CONCAT(
            DISTINCT vle.ledger_name
            ORDER BY vle.ledger_name ) AS ledgers,

        SUM(vle.amount) AS total_ledger_amount,

        GROUP_CONCAT(
            DISTINCT CASE
                WHEN lg.ledger_type = 'CUSTOMER'
                THEN lg.ledger_group
            END
            ORDER BY lg.ledger_group ) AS ledger_group

     FROM voucher_ledger_entries vle

     LEFT JOIN ledgers lg
        ON lg.id = vle.ledger_id

     GROUP BY vle.voucher_id) le
      ON le.voucher_id = i.id

     LEFT JOIN ( SELECT
        voucher_id,GROUP_CONCAT( DISTINCT tax_type ORDER BY tax_type) AS gst_types
      FROM voucher_gst_details
      GROUP BY voucher_id ) gst
      ON gst.voucher_id = i.id
      ${whereClause}

      ORDER BY i.voucher_date DESC;
    `;

    const [rows] = await conn.query(newFlatSql, params);

    return rows;

  } finally {
    if (conn) {
      conn.release();
    }

  }
};
const getPoData= async (scope) => {

  const { manufacturerId, distributorId, userType, accessibleDistributorIds } = scope;

  const conn = await db.getConnection();

  try {

    let whereClause = '';
    let params = [];

    // =========================
    // MANUFACTURER LOGIN
    // =========================
    if (userType === 'MANUFACTURER') {


      whereClause = `
        WHERE i.manufacturer_id = ?
  
        AND i.voucher_type = "Purchase Order"
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
        AND i.voucher_type = "Purchase Order"
      `;

      params = [manufacturerId, distributorId];
    }

    // =========================
    // INVALID USER TYPE SAFETY
    // =========================
    else {
      return [];
    }

    const newFlatSql = `
   SELECT i.uuid AS voucher_id, i.voucher_number, i.voucher_date, i.party_name, 
   i.state_name, itm.stock_item_name, sk.stock_group, sk.category, itm.product_code, itm.quantity, itm.unit, itm.rate, itm.amount FROM vouchers i LEFT JOIN purchase_items itm ON itm.voucher_id = i.id LEFT JOIN stock_items sk ON sk.id = itm.stock_item_id 
   ${whereClause} ORDER BY i.voucher_date DESC
    `;

    const [rows] = await conn.query(newFlatSql, params);

    return rows;

  } finally {
    if (conn) {
      conn.release();
    }

  }
};
const getPOModelData = async (scope) => {

  const {
    manufacturerId,
    distributorId,
    userType,
    accessibleDistributorIds
  } = scope;

  const conn = await db.getConnection();

  try {

    let whereClause = '';
    let params = [];

    // =========================
    // MANUFACTURER LOGIN
    // =========================
    if (userType === 'MANUFACTURER') {

      whereClause = `
      WHERE i.manufacturer_id = ?
      AND i.voucher_type = 'Purchase'
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
      AND i.voucher_type = 'Purchase'
      `;

      params = [manufacturerId, distributorId];
    }

    else {
      return {
        totalSales: 0,
        vouchers: []
      };
    }

    // =========================
    // TOTAL PURCHASE
    // =========================

    const [totalRows] = await conn.execute(
      `
      SELECT
      COALESCE(SUM(i.total_amount),0) AS total_sales
      FROM vouchers i
      ${whereClause}
      `,
      params
    );

    const totalSales = totalRows[0]?.total_sales || 0;

    // =========================
    // VOUCHERS
    // =========================

    const [vouchers] = await conn.execute(
      `
      SELECT
      i.id,
      i.uuid AS voucher_id,
      i.voucher_number,
      i.voucher_date,
      i.effective_date,
      i.party_name,
      i.total_amount,
      i.party_gstin,
      i.company_gstin,
      i.place_of_supply,
      i.state_name
      FROM vouchers i
      ${whereClause}
      ORDER BY i.voucher_date DESC
      `,
      params
    );

    if (!vouchers.length) {
      return {
        totalSales,
        vouchers: []
      };
    }

    const voucherIds = vouchers.map(v => v.id);
    const placeholders = voucherIds.map(() => '?').join(',');

    // =========================
    // FETCH CHILD DATA
    // =========================

    const [
      [parties],
      [addresses],
      [items],
      [ledgers]
    ] = await Promise.all([

      conn.query(
        `
        SELECT
        voucher_id,
        party_type,
        name
        FROM voucher_parties
        WHERE voucher_id IN (${placeholders})
        `,
        voucherIds
      ),

      conn.query(
        `
        SELECT
        voucher_id,
        address_type,
        address_line
        FROM voucher_addresses
        WHERE voucher_id IN (${placeholders})
        `,
        voucherIds
      ),

      conn.query(
        `
     SELECT itm.voucher_id, itm.stock_item_name, sk.stock_group,sk.category, itm.quantity,
      itm.rate, itm.discount, itm.amount FROM purchase_items itm join stock_items sk on sk.id = itm.stock_item_id 
      WHERE voucher_id IN (${placeholders})
        `,
        voucherIds
      ),

      conn.query(
        `
        SELECT
        voucher_id,
        ledger_name,
        amount,
        entry_type
        FROM voucher_ledger_entries
        WHERE voucher_id IN (${placeholders})
        `,
        voucherIds
      )

    ]);

    // =========================
    // BUILD RESPONSE
    // =========================

    const voucherMap = new Map();

    for (const v of vouchers) {

      voucherMap.set(v.id, {
        voucher_id: v.voucher_id,
        voucher_number: v.voucher_number,
        voucher_date: v.voucher_date,
        effective_date: v.effective_date,
        party_name: v.party_name,
        total_amount: v.total_amount,
        party_gstin: v.party_gstin,
        company_gstin: v.company_gstin,
        place_of_supply: v.place_of_supply,
        state: v.state_name,

        parties: [],
        addresses: [],
        items: [],
        ledgers: []
      });
    }

    // =========================
    // PARTIES
    // =========================

    for (const p of parties) {

      const voucher = voucherMap.get(p.voucher_id);

      if (!voucher) continue;

      if (
        !voucher.parties.some(
          x => x.type === p.party_type && x.name === p.name
        )
      ) {
        voucher.parties.push({
          type: p.party_type,
          name: p.name
        });
      }
    }

    // =========================
    // ADDRESSES
    // =========================

    for (const a of addresses) {

      const voucher = voucherMap.get(a.voucher_id);

      if (!voucher) continue;

      if (
        !voucher.addresses.some(
          x => x.type === a.address_type && x.line === a.address_line
        )
      ) {
        voucher.addresses.push({
          type: a.address_type,
          line: a.address_line
        });
      }
    }

    // =========================
    // ITEMS
    // =========================

    for (const item of items) {

      const voucher = voucherMap.get(item.voucher_id);

      if (!voucher) continue;

      if (
        !voucher.items.some(
          x =>
            x.name === item.stock_item_name &&
            x.qty === item.quantity &&
            x.rate === item.rate
        )
      ) {
        voucher.items.push({
          name: item.stock_item_name,
          qty: item.quantity,
          rate: item.rate,
          discount: item.discount,
          amount: item.amount
        });
      }
    }

    // =========================
    // LEDGERS
    // =========================

    for (const ledger of ledgers) {

      const voucher = voucherMap.get(ledger.voucher_id);

      if (!voucher) continue;

      if (
        !voucher.ledgers.some(
          x =>
            x.name === ledger.ledger_name &&
            x.amount === ledger.amount &&
            x.type === ledger.entry_type
        )
      ) {
        voucher.ledgers.push({
          name: ledger.ledger_name,
          amount: ledger.amount,
          type: ledger.entry_type
        });
      }
    }

    return {
      totalSales,
      vouchers: Array.from(voucherMap.values())
    };

  } finally {
    if (conn) {
      conn.release();
    }
  }
};
const getPOWithPartyDetails = async (scope) => {

  const {
    manufacturerId,
    distributorId,
    userType,
    accessibleDistributorIds
  } = scope;

  const conn = await db.getConnection();

  try {

    let whereClause = '';
    let params = [];

    // =========================
    // MANUFACTURER LOGIN
    // =========================
    if (userType === 'MANUFACTURER') {

      // if (!accessibleDistributorIds || accessibleDistributorIds.length === 0) {
      //   return [];
      // }

      // const placeholders = accessibleDistributorIds.map(() => '?').join(',');

      whereClause = `
        WHERE i.manufacturer_id = ?
      
        AND i.voucher_type = 'Purchase Order'
      `;

      params = [manufacturerId, ...accessibleDistributorIds];
    }

    // =========================
    // DISTRIBUTOR LOGIN
    // =========================
    else if (userType === 'DISTRIBUTOR') {

      whereClause = `
        WHERE i.manufacturer_id = ?
        AND i.distributor_id = ?
        AND i.voucher_type = 'Purchase Order'
      `;

      params = [manufacturerId, distributorId];
    }

    // =========================
    // INVALID USER TYPE SAFETY
    // =========================
    else {
      return [];
    }

    const [rows] = await conn.query(`
      SELECT 
        i.uuid AS voucher_id,
        i.voucher_number,
        i.voucher_date,
        i.total_amount,
        i.effective_date,
        i.party_gstin,
        i.company_gstin,
        i.place_of_supply,
        i.state_name,

        p.party_type,
        p.name,
        p.mailing_name,
        p.gstin,
        p.gst_registration_type,
        p.state,
        p.country,

        a.address_type,
        a.address_line,
        a.line_number

      FROM vouchers i

      LEFT JOIN voucher_parties p
        ON i.id = p.voucher_id

      LEFT JOIN voucher_addresses a 
        ON i.id = a.voucher_id 
        AND p.party_type = a.address_type

      ${whereClause}

      ORDER BY i.voucher_date DESC, a.line_number ASC
    `, params);

    const map = new Map();

    for (const r of rows) {

      if (!map.has(r.voucher_id)) {

        map.set(r.voucher_id, {
          voucher_id: r.voucher_id,
          voucher_number: r.voucher_number,
          voucher_date: r.voucher_date,
          total_amount: r.total_amount,
          effective_date: r.effective_date,
          party_gstin: r.party_gstin,
          company_gstin: r.company_gstin,
          place_of_supply: r.place_of_supply,
          state: r.state_name,
          buyer: null,
          consignee: null
        });
      }

      const inv = map.get(r.voucher_id);

      // =========================
      // BUYER
      // =========================
      if (r.party_type === 'BUYER') {

        if (!inv.buyer) {
          inv.buyer = {
            name: r.name,
            mailing_name: r.mailing_name,
            gstin: r.gstin,
            gst_registration_type: r.gst_registration_type,
            state: r.state,
            country: r.country,
            address: new Set()
          };
        }

        if (r.address_line) {
          inv.buyer.address.add(r.address_line);
        }
      }

      // =========================
      // CONSIGNEE
      // =========================
      if (r.party_type === 'CONSIGNEE') {

        if (!inv.consignee) {
          inv.consignee = {
            name: r.name,
            mailing_name: r.mailing_name,
            gstin: r.gstin,
            gst_registration_type: r.gst_registration_type,
            state: r.state,
            country: r.country,
            address: new Set()
          };
        }

        if (r.address_line) {
          inv.consignee.address.add(r.address_line);
        }
      }
    }

    return Array.from(map.values()).map(inv => ({
      ...inv,

      buyer: inv.buyer
        ? {
          ...inv.buyer,
          address: Array.from(inv.buyer.address)
        }
        : null,

      consignee: inv.consignee
        ? {
          ...inv.consignee,
          address: Array.from(inv.consignee.address)
        }
        : null
    }));

  } finally {
    conn.release();
  }
};
const getFullPOView = async (voucheruuid) => {
  const conn = await db.getConnection();

  try {

    const [voucherRows] = await conn.execute(
      `
      SELECT *
      FROM vouchers
      WHERE uuid = ?
      
      `,
      [voucheruuid]
    );

    const voucher = voucherRows[0];

    if (!voucher) {
      return null;
    }

    /*
     * Internal BIGINT FK
     */
    const voucherId = voucher.id;

    /*
     * STEP 2:
     * Parallel child queries using BIGINT FK
     */
    const [
      [partyRows],
      [addressRows],
      [itemRows],
      [ledgerRows],
      [gstRows]
    ] = await Promise.all([
      conn.query(
        `
        SELECT *
        FROM voucher_parties
        WHERE voucher_id = ?
        `,
        [voucherId]
      ),

      conn.query(
        `
        SELECT *
        FROM voucher_addresses
        WHERE voucher_id = ?
        ORDER BY line_number
        `,
        [voucherId]
      ),

      conn.query(
        `
        SELECT *
        FROM purchase_items
        WHERE voucher_id = ?
        `,
        [voucherId]
      ),

      conn.query(
        `
        SELECT *
        FROM voucher_ledger_entries
        WHERE voucher_id = ?
          AND is_party_ledger = 0
        `,
        [voucherId]
      ),

      conn.query(
        `
        SELECT *
        FROM voucher_gst_details
        WHERE voucher_id = ?
        `,
        [voucherId]
      )
    ]);

    /*
     * Party Builder
     */
    const buildParty = (partyType) => {
      const party = partyRows.find(
        p => p.party_type === partyType
      );

      if (!party) return null;

      return {
        name: party.name,
        mailing_name: party.mailing_name,
        gstin: party.gstin,
        gst_registration_type: party.gst_registration_type,
        state: party.state,
        country: party.country,
        address: addressRows
          .filter(a => a.address_type === partyType)
          .map(a => a.address_line)
      };
    };

    /*
     * Parties
     */
    const buyer = buildParty('BUYER');
    const consignee = buildParty('CONSIGNEE');

    /*
     * Items
     */
    const items = itemRows.map(i => ({
      name: i.stock_item_name,
      hsn_code: i.hsn_code,
      quantity: i.quantity,
      unit: i.unit,
      rate: i.rate,
      discount: i.discount,
      amount: i.amount,
      billedqty: i.billedqty
    }));

    /*
     * Ledgers
     */
    const ledgers = ledgerRows.map(l => ({
      name: l.ledger_name,
      amount: l.amount,
      type: l.entry_type,
      is_party_ledger: Boolean(l.is_party_ledger)
    }));

    /*
     * GST
     */
    const gst = gstRows.map(g => ({
      registration_name: g.registration_name,
      tax_type: g.tax_type,
      gstin: g.gstin,
      state: g.state
    }));

    /*
     * Final Response
     */
    return {
      voucher: {
        voucher_id: voucher.uuid,
        voucher_name: "Purchase order",
        voucher_number: voucher.voucher_number,
        voucher_date: voucher.voucher_date,
        effective_date: voucher.effective_date,
        party_name: voucher.party_name,
        party_ledger_name: voucher.party_ledger_name,
        party_gstin: voucher.party_gstin,
        company_gstin: voucher.company_gstin,
        place_of_supply: voucher.place_of_supply,
        state_name: voucher.state_name,
        narration: voucher.narration,
        total_amount: voucher.total_amount
      },

      buyer,
      consignee,
      items,
      ledgers,
      gst
    };

  } catch (error) {
    console.error('Error fetching purchase order:', error);
    throw error;
  } finally {
    if (conn) {
      conn.release();
    }

  }
};

export default { getFlatPurchaseOrders, getFullPOView, getPOWithPartyDetails, getPOModelData,getPoData }