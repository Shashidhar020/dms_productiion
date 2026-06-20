import { db } from '../../config/database.js';
const normalizeName = (name) => String(name || "").trim().toUpperCase();
export const insertInvoicesBulk = (conn, rows) => {
  return conn.query(
    `INSERT INTO sales 
    (manufacturer_id , 
    distributor_id,uuid, guid, voucher_number, voucher_type, invoice_date, effective_date,
     party_name, party_ledger_name, party_gstin, company_gstin,
     place_of_supply, state_name, cmpstate,	consigneestate,narration, sub_total, total_amount, created_by)
    VALUES ?
    ON DUPLICATE KEY UPDATE 
      voucher_number = VALUES(voucher_number),
      voucher_type = VALUES(voucher_type),
      invoice_date = VALUES(invoice_date),
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
    `INSERT INTO sales_parties
    (sales_id, party_type, name, mailing_name, gstin,
     gst_registration_type, state, country, pincode, pan_number, base_name)
    VALUES ?`,
    [rows]
  );
};

export const insertAddressesBulk = (conn, rows) => {
  return conn.query(
    `INSERT INTO sales_addresses
    (sales_id, address_type, line_number, address_line)
    VALUES ?`,
    [rows]
  );
};

export const insertGSTBulk = (conn, rows) => {
  return conn.query(
    `INSERT INTO sales_gst_details
    (sales_id, registration_name, tax_type, gstin, state)
    VALUES ?`,
    [rows]
  );
};

export const insertItemsBulk = (conn, rows) => {
  return conn.query(
    `INSERT INTO sales_items
    (uuid, sales_id, stock_item_id, stock_item_name,product_code,
     hsn_code, quantity, unit, rate,discount, amount, billedqty,mrp_rate,inclvatrate,gst_rate)
    VALUES ?`,
    [rows]
  );
};

export const insertBatchBulk = (conn, rows) => {
  return conn.query(
    `INSERT INTO sales_batch_allocations
    (item_uuid, order_no, godown_name, batch_name, quantity, rate, amount)
    VALUES ?`,
    [rows]
  );
};

export const insertLedgerEntriesBulk = (conn, rows) => {
  return conn.query(
    `INSERT INTO sales_ledger_entries
    (sales_id, ledger_id, ledger_name, amount, entry_type, is_party_ledger)
    VALUES ?`,
    [rows]
  );
};

export const insertCostCentresBulk = (conn, rows) => {
  return conn.query(
    `INSERT INTO sales_cost_center_alllocations
    (sales_id, ledger_name, category, cost_centre_name, amount)
    VALUES ?`,
    [rows]
  );
};

export const insertBillAllocationsBulk = (conn, rows) => {
  return conn.query(
    `INSERT INTO sales_bill_allocations
    (sales_id, ledger_name, bill_name, bill_type, credit_period, amount)
    VALUES ?`,
    [rows]
  );
};


export const bulkUpsertStockItems = async (conn, map, auth) => {
  const rows = Array.from(map.values());
  if (!rows.length) return new Map();
  await conn.query(
    `INSERT INTO stock_items
    (manufacturer_id, distributor_id,name,stock_group,category,product_code, hsn_code, base_unit, gst_taxability, gst_rate, is_from_invoice, is_synced)
    VALUES ?
    ON DUPLICATE KEY UPDATE
      product_code = CASE WHEN is_synced=FALSE THEN VALUES(product_code) ELSE product_code END,
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


export const getSOSummary = async (scope) => {

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
    AND i.voucher_type = 'Sale Order'
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
    AND i.voucher_type = 'Sale Order'
  `;

      params = [manufacturerId, distributorId];
    }

    else {
      return {
        totalSales: 0,
        invoices: []
      };
    }

    // =========================
    // TOTAL SALES
    // =========================
    const [totalRows] = await conn.execute(
      `
  SELECT
    COALESCE(SUM(i.total_amount), 0) AS total_sales
  FROM sales i
  ${whereClause}
  `,
      params
    );

    const totalSales = totalRows[0]?.total_sales || 0;

    // =========================
    // INVOICES
    // =========================
    const [invoices] = await conn.execute(
      `
  SELECT
    i.id,
    i.uuid AS invoice_id,
    i.voucher_number,
    i.invoice_date,
    i.effective_date,
    i.party_name,
    i.total_amount,
    i.party_gstin,
    i.company_gstin,
    i.place_of_supply,
    i.state_name
  FROM sales i
  ${whereClause}
  ORDER BY i.invoice_date DESC
  `,
      params
    );

    if (!invoices.length) {
      return {
        totalSales,
        invoices: []
      };
    }

    const salesIds = invoices.map(i => i.id);

    // =========================
    // FETCH CHILD DATA
    // =========================
    const placeholders = salesIds.map(() => '?').join(',');

    const [
      [parties],
      [addresses],
      [items],
      [ledgers]
    ] = await Promise.all([

      conn.query(
        `
    SELECT
      sales_id,
      party_type,
      name
    FROM sales_parties
    WHERE sales_id IN (${placeholders})
    `,
        salesIds
      ),

      conn.query(
        `
    SELECT
      sales_id,
      address_type,
      address_line
    FROM sales_addresses
    WHERE sales_id IN (${placeholders})
    `,
        salesIds
      ),

      conn.query(
        `
      SELECT itm.sales_id, itm.stock_item_name,sk.stock_group,sk.category, itm.quantity, 
      itm.rate, itm.discount, itm.amount FROM sales_items
      itm join stock_items sk on sk.id = itm.stock_item_id WHERE sales_id IN (${placeholders})
    `,
        salesIds
      ),

      conn.query(
        `
    SELECT
      sales_id,
      ledger_name,
      amount,
      entry_type
    FROM sales_ledger_entries
    WHERE sales_id IN (${placeholders})
    `,
        salesIds
      )

    ]);

    // =========================
    // BUILD RESPONSE
    // =========================
    const invoiceMap = new Map();

    for (const inv of invoices) {

      invoiceMap.set(inv.id, {
        invoice_id: inv.invoice_id,
        voucher_number: inv.voucher_number,
        invoice_date: inv.invoice_date,
        effective_date: inv.effective_date,
        party_name: inv.party_name,
        total_amount: inv.total_amount,
        party_gstin: inv.party_gstin,
        company_gstin: inv.company_gstin,
        place_of_supply: inv.place_of_supply,
        state: inv.state_name,

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

      const invoice = invoiceMap.get(p.sales_id);

      if (!invoice) continue;

      invoice.parties.push({
        type: p.party_type,
        name: p.name
      });
    }

    // =========================
    // ADDRESSES
    // =========================
    for (const a of addresses) {

      const invoice = invoiceMap.get(a.sales_id);

      if (!invoice) continue;

      invoice.addresses.push({
        type: a.address_type,
        line: a.address_line
      });
    }

    // =========================
    // ITEMS
    // =========================
    for (const item of items) {

      const invoice = invoiceMap.get(item.sales_id);

      if (!invoice) continue;

      invoice.items.push({
        name: item.stock_item_name,
        qty: item.quantity,
        rate: item.rate,
        stockGroup: item.stock_group,
        category: item.category,
        discount: item.discount,
        amount: item.amount
      });
    }

    // =========================
    // LEDGERS
    // =========================
    for (const ledger of ledgers) {

      const invoice = invoiceMap.get(ledger.sales_id);

      if (!invoice) continue;

      invoice.ledgers.push({
        name: ledger.ledger_name,
        amount: ledger.amount,
        type: ledger.entry_type
      });
    }

    return {
      totalSales,
      invoices: Array.from(invoiceMap.values())
    };


  } finally {


    if (conn) {
      conn.release();
    }

  }
};

export const getSOPartyDetails = async (scope) => {

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
        AND i.voucher_type = 'Sale Order'
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
        AND i.voucher_type = 'Sale Order'
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
        i.uuid AS invoice_id,
        i.voucher_number,
        i.invoice_date,
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

      FROM sales i

      LEFT JOIN sales_parties p
        ON i.id = p.sales_id

      LEFT JOIN sales_addresses a 
        ON i.id = a.sales_id 
        AND p.party_type = a.address_type

      ${whereClause}

      ORDER BY i.invoice_date DESC, a.line_number ASC
    `, params);

    const map = new Map();

    for (const r of rows) {

      if (!map.has(r.invoice_id)) {

        map.set(r.invoice_id, {
          invoice_id: r.invoice_id,
          voucher_number: r.voucher_number,
          invoice_date: r.invoice_date,
          effective_date: r.effective_date,
          total_amount: r.total_amount,
          party_gstin: r.party_gstin,
          company_gstin: r.company_gstin,
          place_of_supply: r.place_of_supply,
          state: r.state_name,
          buyer: null,
          consignee: null
        });
      }

      const inv = map.get(r.invoice_id);

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
    if (conn) {
      conn.release();
    }

  }
};

const getFullSOView = async (invoiceUuid) => {

  const conn = await db.getConnection();

  try {
    /*
     * STEP 1:
     * Fetch invoice using UUID
     */
    const [invoiceRows] = await conn.execute(
      `
      SELECT *
      FROM sales
      WHERE uuid = ?
      
      `,
      [invoiceUuid]
    );

    const invoice = invoiceRows[0];

    if (!invoice) {
      return null;
    }

    /*
     * Internal BIGINT FK
     */
    const salesId = invoice.id;

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
        FROM sales_parties
        WHERE sales_id = ?
        `,
        [salesId]
      ),

      conn.query(
        `
        SELECT *
        FROM sales_addresses
        WHERE sales_id = ?
        ORDER BY line_number
        `,
        [salesId]
      ),

      conn.query(
        `
        SELECT *
        FROM sales_items
        WHERE sales_id = ?
        `,
        [salesId]
      ),

      conn.query(
        `
        SELECT *
        FROM sales_ledger_entries
        WHERE sales_id = ?
          AND is_party_ledger = 0
        `,
        [salesId]
      ),

      conn.query(
        `
        SELECT *
        FROM sales_gst_details
        WHERE sales_id = ?
        `,
        [salesId]
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
      invoice: {
        invoice_id: invoice.uuid,
        voucher_name: 'Sales order',
        voucher_number: invoice.voucher_number,
        invoice_date: invoice.invoice_date,
        effective_date: invoice.effective_date,
        party_name: invoice.party_name,
        party_ledger_name: invoice.party_ledger_name,
        party_gstin: invoice.party_gstin,
        company_gstin: invoice.company_gstin,
        place_of_supply: invoice.place_of_supply,
        state_name: invoice.state_name,
        narration: invoice.narration,
        total_amount: invoice.total_amount
      },

      buyer,
      consignee,
      items,
      ledgers,
      gst
    };

  } catch (error) {
    console.error('Error fetching sales order:', error);
    throw error;
  } finally {
    if (conn) {
      conn.release();
    }

  }
};

export const getFlatSOReport = async (scope) => {

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

    if (userType === 'MANUFACTURER') {

      whereClause = `
        WHERE i.manufacturer_id = ?
        AND i.voucher_type = 'Sale Order'
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
        AND i.voucher_type = 'Sale Order'
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
    i.uuid AS invoice_id,
    i.voucher_number,
    i.invoice_date,
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

    FROM sales i

    LEFT JOIN sales_items itm
     ON itm.sales_id = i.id

    LEFT JOIN stock_items sk
    ON sk.id = itm.stock_item_id

    LEFT JOIN sales_parties buyer
    ON buyer.sales_id = i.id
    AND buyer.party_type = 'BUYER'

    LEFT JOIN sales_parties consignee
    ON consignee.sales_id = i.id
    AND consignee.party_type = 'CONSIGNEE'

    LEFT JOIN (
    SELECT
        sle.sales_id,

        GROUP_CONCAT(
            DISTINCT sle.ledger_name
            ORDER BY sle.ledger_name ) AS ledgers,

        SUM(sle.amount) AS total_ledger_amount,

        GROUP_CONCAT(
            DISTINCT CASE
                WHEN lg.ledger_type = 'CUSTOMER'
                THEN lg.ledger_group
            END
            ORDER BY lg.ledger_group) AS ledger_group

    FROM sales_ledger_entries sle

    LEFT JOIN ledgers lg
        ON lg.id = sle.ledger_id

    GROUP BY sle.sales_id) le
    ON le.sales_id = i.id

  LEFT JOIN (
    SELECT
        sales_id,
        GROUP_CONCAT(
            DISTINCT tax_type
            ORDER BY tax_type) AS gst_types
    FROM sales_gst_details
    GROUP BY sales_id) gst
    ON gst.sales_id = i.id
   ${whereClause}
   ORDER BY i.invoice_date DESC;
    `;


    const [rows] = await conn.query(newFlatSql, params);

    return rows;

  } finally {
    if (conn) {
      conn.release();
    }

  }
};
export const getSoData = async (scope) => {

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
        AND i.voucher_type = 'Sale Order'
      `;

      params = [
        manufacturerId
      ];
    }

    // =========================
    // DISTRIBUTOR LOGIN
    // =========================
    else if (userType === 'DISTRIBUTOR') {

      whereClause = `
        WHERE i.manufacturer_id = ?
        AND i.distributor_id = ?
        AND i.voucher_type = 'Sale Order'
      `;

      params = [
        manufacturerId,
        distributorId
      ];
    }


    else {
      return [];
    }


    const newFlatSql = `
  SELECT i.uuid AS invoice_id, i.voucher_number, i.invoice_date, i.party_name, i.state_name,itm.stock_item_name, sk.stock_group, sk.category, itm.product_code, itm.quantity, itm.unit, itm.rate, 
  itm.amount FROM sales i LEFT JOIN sales_items itm ON itm.sales_id = i.id LEFT JOIN stock_items sk ON sk.id = itm.stock_item_id 
 ${whereClause} ORDER BY i.invoice_date DESC
    `;

    const [rows] = await conn.query(
      newFlatSql,
      params
    );

    return rows;

  } finally {
    if (conn) {
      conn.release()
    }

  }
};
export default { getSOSummary, getFullSOView, getSOPartyDetails, getFlatSOReport,getSoData }