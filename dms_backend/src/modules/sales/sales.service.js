
import {
  insertInvoicesBulk,
  insertPartiesBulk,
  insertAddressesBulk,
  insertGSTBulk,
  insertItemsBulk,
  insertBatchBulk,
  insertCostCentresBulk,
  insertBillAllocationsBulk,
  insertLedgerEntriesBulk,
  bulkUpsertStockItems,
  bulkUpsertLedgers,
  getSalesModelData,
  getStockItems as getStockItemsModel,
  getLedgers as getLedgersModel,
  getSalesWithPartyDetails,
  getFullInvoiceView,
  getdashboardData,
  getFlatSalesReport,
  getsalesSummary
} from '../../models/sale.model.js';
import { db } from '../../config/database.js';
import { nanoid } from 'nanoid';


const parseQty = (str) => {
  if (!str) return { qty: 0, unit: null };

  const [q, u] = str.trim().split(/\s+/);

  return {
    qty: parseFloat(String(q).replace(/,/g, "")) || 0,
    unit: u || null
  };
};

const parseRate = (str) => {
  if (!str) return 0;

  return (parseFloat(String(str).split("/")[0].replace(/,/g, "").trim()) || 0);
};

const normalizeName = (name) => String(name || "").trim().toUpperCase();

const formatDate = (d) => {
  if (!d) return null;
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return null;
  return parsed.toISOString().split("T")[0];
};

const chunkArray = (arr, size = 500) => {
  const chunks = [];

  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }

  return chunks;
};

const processAddress = (arr, type, invoiceUUID, addressRows, field = "address") => {
  if (!Array.isArray(arr)) return;

  let lineNumber = 0;

  for (const row of arr) {
    const line = row?.[field];

    if (!line) continue;

    addressRows.push([
      invoiceUUID,
      type,
      lineNumber++,
      String(line).trim()
    ]);
  }
};

const deleteAllTables = async (conn, uuids) => {
  if (!uuids.length) return;

  const chunks = chunkArray(uuids, 500);

  for (const chunk of chunks) {
    await conn.query(
      `
      DELETE ba
      FROM sales_batch_allocations ba
      JOIN sales_items ii
        ON ba.item_uuid = ii.uuid
      WHERE ii.sales_id IN (?)
      `,
      [chunk]
    );

    await conn.query(
      `DELETE FROM sales_items WHERE sales_id IN (?)`,
      [chunk]
    );

    await conn.query(
      `DELETE FROM sales_ledger_entries WHERE sales_id IN (?)`,
      [chunk]
    );

    await conn.query(
      `DELETE FROM sales_cost_center_alllocations WHERE sales_id IN (?)`,
      [chunk]
    );

    await conn.query(
      `DELETE FROM sales_bill_allocations WHERE sales_id IN (?)`,
      [chunk]
    );

    await conn.query(
      `DELETE FROM sales_parties WHERE sales_id IN (?)`,
      [chunk]
    );

    await conn.query(
      `DELETE FROM sales_addresses WHERE sales_id IN (?)`,
      [chunk]
    );

    await conn.query(
      `DELETE FROM sales_gst_details WHERE sales_id IN (?)`,
      [chunk]
    );
  }
};

function normalizeVoucher(v) {
  const nv = { ...v };

  nv.ledgerentries = nv.allledgerentries || nv.ledgerentries || [];

  nv.allinventoryentries = [
    ...(nv.allinventoryentries || [])
  ];

  if (nv.allledgerentries) {
    for (const ledger of nv.allledgerentries) {
      if (ledger.inventoryallocations) {
        nv.allinventoryentries.push(
          ...ledger.inventoryallocations.map((inv) => ({
            ...inv,
            ledgername: ledger.ledgername
          }))
        );
      }
    }
  }

  return nv;
}

export const createBulkSales = async (payload, auth = {}) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // ========================
    // STEP 1: NORMALIZE ONCE
    // ========================

    const vouchers = (payload.sales || []).map(normalizeVoucher);

    const invoiceRows = [];
    const partyRows = [];
    const addressRows = [];
    const gstRows = [];
    const itemRows = [];
    const batchRows = [];
    const ledgerRows = [];
    const masterIds = [];
    const costCentreRows = [];
    const billRows = [];

    const stockMap = new Map();
    const ledgerMap = new Map();

    const manufacturerId = auth.manufacturerId;
    const distributorId = auth.distributorId;

    // ========================
    // STEP 2: COLLECT MASTERS
    // ========================

    for (const v of vouchers) {
      // ===== STOCKS =====

      for (const item of v.allinventoryentries || []) {
        const stockKey = normalizeName(item.stockitemname);

        if (!stockMap.has(stockKey)) {
          const rate = parseRate(item.rate);
          const incl = parseRate(item.inclvatrate);
          stockMap.set(stockKey, {
            mid: manufacturerId,
            did: distributorId,
            name: stockKey,
            stk_group: item.stockgroup,
            category: item.category,
            product_code:item.skucode,
            hsn: item.gsthsncode || null,
            unit: parseQty(item.actualqty).unit || null,
            taxability: item.gstovrdntaxability || "Taxable",
            taxRate: parseFloat(String(item.igstrate || "").replace("%", "").trim()) ||
              (parseFloat(String(item.cgstrate || "").replace("%", "").trim()) +
                parseFloat(String(item.sgstrate || "").replace("%", "").trim())) || 0
          });
        }
      }

      // ===== LEDGERS =====

      for (const l of v.ledgerentries || []) {
        const ledgerKey = normalizeName(l.ledgername);

        if (!ledgerMap.has(ledgerKey)) {
          ledgerMap.set(ledgerKey, {
            mid: manufacturerId,
            did: distributorId,
            name: l.ledgername,
            group: l.ledgergroup,
            type: l.ispartyledger ? "CUSTOMER" : "GENERAL",
            gstno: l.ispartyledger ? v.partygstin : null,
            state: l.ispartyledger ? v.statename : null,
            country: l.ispartyledger ? v.countryofresidence : null,
            pincode: l.ispartyledger ? v.partypincode : null
          });
        }
      }
    }

    // ========================
    // STEP 3: UPSERT MASTERS
    // ========================

    const stockIdMap = await bulkUpsertStockItems(conn, stockMap, auth);

    const ledgerIdMap = await bulkUpsertLedgers(conn, ledgerMap, auth);

    // ========================
    // STEP 4: PREPARE INVOICES
    // ========================

    for (const v of vouchers) {
      const subtotal = (v.allinventoryentries || []).reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
      let total = 0;

      for (const l of v.ledgerentries || []) {
        if (l.ispartyledger) {
          total = Math.abs(parseFloat(l.amount || 0));
        }
      }

      invoiceRows.push([
        manufacturerId,
        distributorId,
        nanoid(),
        v.guid,
        v.vouchernumber,
        "Sales",

        formatDate(v.date),
        formatDate(v.referencedate),

        v.partyname,
        v.partyledgername,

        v.partygstin || null,
        v.cmpgstin || null,

        v.placeofsupply,
        v.statename,
        v.cmpgststate,
        v.consigneestatename,

        v.narration || null,

        subtotal,
        total,

        v.enteredby
      ]);

      masterIds.push( {masterkey:v.masterid});
    }

    // ========================
    // STEP 5: UPSERT INVOICES
    // ========================

    await insertInvoicesBulk(conn, invoiceRows);

    // ========================
    // STEP 6: FETCH UUID MAP
    // ========================

    const [rows] = await conn.query(
      `
      SELECT guid, id
      FROM sales
      WHERE guid IN (?)
      `,
      [vouchers.map((v) => v.guid)]
    );

    const invoiceMap = new Map(rows.map((r) => [r.guid, r.id]));

    const uuids = Array.from(invoiceMap.values());

    // ========================
    // STEP 7: DELETE OLD CHILD DATA
    // ========================

    await deleteAllTables(conn, uuids);

    // ========================
    // STEP 8: PREPARE CHILD DATA
    // ========================

    for (const v of vouchers) {
      const invoiceUUID = invoiceMap.get(v.guid);

      // ===== PARTIES =====

      partyRows.push([
        invoiceUUID,
        "BUYER",

        v.basicbuyername || v.partyname,

        v.partymailingname,

        v.partygstin || null,

        v.cmpgstregistrationtype || null,

        v.statename || null,

        v.countryofresidence || null,

        v.partypincode || null,

        null,

        v.basicbasepartyname || null
      ]);

      if (v.consigneemailingname) {
        partyRows.push([
          invoiceUUID,
          "CONSIGNEE",

          v.consigneemailingname,

          v.consigneemailingname,

          v.consigneegstin || null,

          null,

          v.consigneestatename || null,

          v.consigneecountryname || null,

          v.consigneepincode || null,

          v.consigneepinnumber || null,

          null
        ]);
      }

      // ===== ADDRESSES =====

      processAddress(v.basicbuyeraddress, "BUYER", invoiceUUID, addressRows, "basicbuyeraddress");

      processAddress(v.address, "CONSIGNEE", invoiceUUID, addressRows, "address");

      processAddress(v.dispatchfromaddress, "DISPATCH_FROM", invoiceUUID, addressRows, "address");

      if (!v.address && v.basicbuyeraddress) {
        processAddress(v.basicbuyeraddress, "CONSIGNEE", invoiceUUID, addressRows, "basicbuyeraddress");
      }

      // ===== GST =====

      if (v.gstregistration) {
        gstRows.push([
          invoiceUUID,
          v.gstregistration.value,
          v.gstregistration.taxtype,
          v.gstregistration.taxregistration,
          v.statename
        ]);
      }

      // ===== ITEMS =====

      for (const item of v.allinventoryentries || []) {
        const stockId = stockIdMap.get(normalizeName(item.stockitemname));

        const itemUUID = nanoid();

        const { qty, unit } = parseQty(item.actualqty);

        let cgst = 0;
        let sgst = 0;
        let igst = 0;

        for (const rate of item.ratedetails || []) {
          const value = parseFloat(String(rate.gstrate || "0").replace("%", "").trim());

          if (rate.gstratedutyhead === "CGST") {
            cgst = value;
          }
          else if (rate.gstratedutyhead === "SGST/UTGST") {
            sgst = value;
          }
          else if (rate.gstratedutyhead === "IGST") {
            igst = value;
          }
        }

        const gstRate = igst > 0 ? igst : cgst + sgst ||
          parseFloat(String(item.igstrate || "").replace("%", "").trim()) ||
          (parseFloat(String(item.cgstrate || "").replace("%", "").trim()) +
            parseFloat(String(item.sgstrate || "").replace("%", "").trim())) || 0;

        itemRows.push([
          itemUUID,
          invoiceUUID,
          stockId,
          item.stockitemname,
          item.skucode,
          item.gsthsncode,
          qty,
          unit,

          parseRate(item.rate),

          item.discount ? parseFloat(item.discount) : null,

          parseFloat(item.amount || 0),

          qty,

          item.mrprate ? parseRate(item.mrprate) : null,

          item.inclvatrate ? parseRate(item.inclvatrate) : null,

          gstRate
        ]);

        // ===== BATCH =====

        for (const b of item.batchallocations || []) {
          batchRows.push([
            itemUUID,
            b.orderno,
            b.godownname,

            b.batchname,

            parseQty(b.actualqty).qty,

            parseRate(b.batchrate),

            parseFloat(b.amount || 0)
          ]);
        }
      }

      // ===== LEDGERS =====

      for (const l of v.ledgerentries || []) {
        const ledgerId = ledgerIdMap.get(normalizeName(l.ledgername));

        ledgerRows.push([
          invoiceUUID,

          ledgerId,

          l.ledgername,
          parseFloat(l.amount || 0),

          l.isdeemedpositive ? "DEBIT" : "CREDIT",

          l.ispartyledger
        ]);

        // ===== COST CENTRES =====

        for (const cat of l.categoryallocations || []) {
          for (const cc of cat.costcentreallocations || []) {
            costCentreRows.push([
              invoiceUUID,

              l.ledgername,

              cat.category,

              cc.name,

              parseFloat(cc.amount || 0)
            ]);
          }
        }

        // ===== BILL ALLOCATIONS =====

        for (const b of l.billallocations || []) {
          billRows.push([
            invoiceUUID,

            l.ledgername,

            b.name,

            b.billtype,

            b.billcreditperiod,

            parseFloat(b.amount || 0)
          ]);
        }
      }
    }

    // ========================
    // STEP 9: INSERT CHILD DATA
    // ========================

    if (partyRows.length) {

      await insertPartiesBulk(conn, partyRows);
    }

    if (addressRows.length) {

      await insertAddressesBulk(conn, addressRows);
    }

    if (gstRows.length) {

      await insertGSTBulk(conn, gstRows);
    }

    if (itemRows.length) {

      await insertItemsBulk(conn, itemRows);
    }

    if (batchRows.length) {

      await insertBatchBulk(conn, batchRows);
    }

    if (ledgerRows.length) {
      await insertLedgerEntriesBulk(conn, ledgerRows);
    }

    if (costCentreRows.length) {
      await insertCostCentresBulk(conn, costCentreRows);
    }

    if (billRows.length) {
      await insertBillAllocationsBulk(conn, billRows);
    }

    // ========================
    // STEP 10: COMMIT
    // ========================

    await conn.commit();

    return {
      success: true,
      count: vouchers.length,
      masters: masterIds
    };
  } catch (err) {
    await conn.rollback();

    throw err;
  } finally {
    conn.release();
  }
};

export const getSalesServiceData = async (scope) => {
  return getSalesModelData(scope);
};

// GET StockItems
export const getStockItemsService = async () => {
  const data = await getStockItemsModel();

  return {
    count: data.length,
    data
  };
};


// GET Ledger
export const getLedgersService = async () => {
  const data = await getLedgersModel();

  return {
    count: data.length,
    data
  };
};

// GET Sales With Party Details
export const getSalesWithPartyDetailsservice = async (scope) => {
  return getSalesWithPartyDetails(scope)
}

export const getinvoiceService = async (invoiceId) => {
  return getFullInvoiceView(invoiceId)
}

export const getDashboardDataservice = async (scope) => {
  return getdashboardData(scope)
}

export const getFlatSalesReportservice = async (scope) => {
  return getFlatSalesReport(scope)
}
export const getSalesSummaryservice = async (scope) => {
  return getsalesSummary(scope)
}
