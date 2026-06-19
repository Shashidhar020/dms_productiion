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
  
} from './sales-order.repository.js'
import salesOrderRepository from './sales-order.repository.js';
import { db } from '../../config/database.js';
import { nanoid } from 'nanoid';


const parseQty = (str) => {
  if (!str) return { qty: 0, unit: null };

  const [q, u] = str.trim().split(/\s+/);

  return {
    qty: parseFloat(String(q).replace(/,/g, "")) || 0,
    unit: u || null
  };
}


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

    await conn.query(`
      DELETE ba FROM sales_batch_allocations ba
      JOIN sales_items ii ON ba.item_uuid = ii.uuid
      WHERE ii.sales_id IN (?)
    `, [chunk]);

    await conn.query(`DELETE FROM sales_items WHERE sales_id IN (?)`, [chunk]);
    await conn.query(`DELETE FROM sales_ledger_entries WHERE sales_id IN (?)`, [chunk]);
    await conn.query(`DELETE FROM sales_cost_center_alllocations WHERE sales_id IN (?)`, [chunk]);
    await conn.query(`DELETE FROM sales_bill_allocations WHERE sales_id IN (?)`, [chunk]);
    await conn.query(`DELETE FROM sales_parties WHERE sales_id IN (?)`, [chunk]);
    await conn.query(`DELETE FROM sales_addresses WHERE sales_id IN (?)`, [chunk]);
    await conn.query(`DELETE FROM sales_gst_details WHERE sales_id IN (?)`, [chunk]);
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
    const vouchers = (payload['salesorders'] || []).map(normalizeVoucher);
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
    const manufacturerId = auth.manufacturerId
    const distributorId = auth.distributorId


    // STEP 1: COLLECT MASTERS
    for (let v of vouchers) {
      v = normalizeVoucher(v);

      for (const item of v.allinventoryentries || []) {
        const key = normalizeName(item.stockitemname);

        if (!stockMap.has(key)) {
          // const rate = parseRate(item.rate);
          // const incl = parseRate(item.inclvatrate);

          stockMap.set(key, {
            mid: manufacturerId,
            did: distributorId,
            name: key,
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
      for (const l of v.ledgerentries || []) {
        const ledgerKey = normalizeName(l.ledgername);
        if (!ledgerMap.has(ledgerKey)) {
          ledgerMap.set(ledgerKey, {
            mid: manufacturerId,
            did: distributorId,
            name: l.ledgername,
            group: l.ledgergroup,
            type: l.ispartyledger ? 'CUSTOMER' : 'GENERAL',
            gstno: l.ispartyledger ? v.partygstin : null,
            state: l.ispartyledger ? v.statename : null,
            country: l.ispartyledger ? v.countryofresidence : null,
            pincode: l.ispartyledger ? v.partypincode : null,
          });
        }
      }
    }

    const stockIdMap = await bulkUpsertStockItems(conn, stockMap, auth);
    const ledgerIdMap = await bulkUpsertLedgers(conn, ledgerMap, auth);
    // ========================
    // STEP 2: PREPARE INVOICES

    for (let v of vouchers) {

      const subtotal = (v.allinventoryentries || []).reduce(
        (s, i) => s + parseFloat(i.amount || 0),
        0
      );

      let total = 0;
      for (const l of v.ledgerentries || []) {
        if (l.ispartyledger) {
          total = Math.abs(parseFloat(l.amount || 0));
        }
      }
      invoiceRows.push([
        manufacturerId,
        distributorId,
        nanoid(), // temporary
        v.guid,
        v.vouchernumber,
        "Sale Order",
        formatDate(v.date),
        formatDate(v.effectivedate),
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
    // STEP 3: UPSERT INVOICES
    // ========================
    await insertInvoicesBulk(conn, invoiceRows);
    // ========================
    // STEP 4: FETCH UUID MAP
    // ========================

    const [rows] = await conn.query(
      `SELECT guid, id FROM sales WHERE guid IN (?)`,
      [vouchers.map(v => v.guid)]
    );

    const invoiceMap = new Map(rows.map(r => [r.guid, r.id]));
    const uuids = Array.from(invoiceMap.values());

    // ========================
    // STEP 5: DELETE OLD CHILD DATA
    // ========================
    await deleteAllTables(conn, uuids);
    for (let v of vouchers) {
      v = normalizeVoucher(v);
      const invoiceUUID = invoiceMap.get(v.guid);

      // ===== PARTY =====
      partyRows.push([
        invoiceUUID,
        'BUYER',
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
          'CONSIGNEE',
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
      processAddress(v.basicbuyeraddress, 'BUYER', invoiceUUID, addressRows, "basicbuyeraddress");
      processAddress(v.address, 'CONSIGNEE', invoiceUUID, addressRows, "address");
      processAddress(v.dispatchfromaddress, 'DISPATCH_FROM', invoiceUUID, addressRows, "address");

      if (!v.address && v.basicbuyeraddress) {
        processAddress(v.basicbuyeraddress, 'CONSIGNEE', invoiceUUID, addressRows, "basicbuyeraddress");
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

      // ===== ITEMS + BATCH =====
      for (const item of v.allinventoryentries || []) {
        const stockId = stockIdMap.get(normalizeName(item.stockitemname));
        const itemUUID = nanoid();
        const { qty, unit } = parseQty(item.actualqty);
        let cgst = 0, sgst = 0, igst = 0;

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

        for (const b of item.batchallocations || []) {
          batchRows.push([
            itemUUID,
            b.orderno,
            b.godownname,
            b.batchname,
            parseQty(b.actualqty).qty,
            parseRate(b.inclvatrate),
            parseFloat(b.amount)
          ]);
        }
      }


      // ===== LEDGER =====
      for (const l of v.ledgerentries || []) {
        const ledgerId = ledgerIdMap.get(normalizeName(l.ledgername));
        ledgerRows.push([
          invoiceUUID,
          ledgerId,
          l.ledgername,
          parseFloat(l.amount ?? 0),
          l.isdeemedpositive ? 'DEBIT' : 'CREDIT',
          l.ispartyledger
        ]);
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
    // STEP 7: INSERT ALL CHILD DATA
    if (partyRows.length) await insertPartiesBulk(conn, partyRows);
    if (addressRows.length) await insertAddressesBulk(conn, addressRows);
    if (gstRows.length) await insertGSTBulk(conn, gstRows);
    if (itemRows.length) await insertItemsBulk(conn, itemRows);
    if (batchRows.length) await insertBatchBulk(conn, batchRows);
    if (ledgerRows.length) await insertLedgerEntriesBulk(conn, ledgerRows);
    if (costCentreRows.length) await insertCostCentresBulk(conn, costCentreRows);
    if (billRows.length) await insertBillAllocationsBulk(conn, billRows);
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

const getFlatSOReport = async (scope) => {
  return salesOrderRepository.getFlatSOReport(scope)
}
const getSOSummary = async (scope) => {
  return salesOrderRepository.getSOSummary(scope)
};

const getSOPartyDetails = async (scope) => {
  return salesOrderRepository.getSOPartyDetails(scope)
}

const getFullSOView = async (voucherId) => {
  return salesOrderRepository.getFullSOView(voucherId)
}
 const getSoData = async (scope) => {
  return salesOrderRepository.getSoData(scope)
}
export default { getFlatSOReport, getSOSummary, getSOPartyDetails, getFullSOView,getSoData }