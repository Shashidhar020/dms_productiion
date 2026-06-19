// const express = require("express");
// const app = express();

// app.use(express.json());

// app.post("/calculate", (req, res) => {
//     try {
//         const voucher = req.body.tallymessage?.[0];

//         if (!voucher) {
//             return res.status(400).json({ error: "Invalid data" });
//         }
//         let subtotal = 0;
//         let total = 0;

//         let positiveAdjustments = 0;
//         let negativeAdjustments = 0;

//         let adjustmentsList = [];

//         // 🔹 1. Subtotal (items after discount)
//         if (voucher.allinventoryentries) {
//             subtotal = voucher.allinventoryentries.reduce((sum, item) => {
//                 return sum + parseFloat(item.amount || 0);
//             }, 0);
//         }

//         // 🔹 2. Ledger processing (NO NAME DEPENDENCY)
//         if (voucher.ledgerentries) {
//             voucher.ledgerentries.forEach((entry) => {
//                 const amount = parseFloat(entry.amount || 0);

//                 if (entry.ispartyledger) {
//                     total = Math.abs(amount);
//                 } else {
//                     // classify only by sign
//                     if (amount >= 0) {
//                         positiveAdjustments += amount;
//                     } else {
//                         negativeAdjustments += amount;
//                     }

//                     // keep raw trace (important for frontend/debug)
//                     adjustmentsList.push({
//                         amount: amount,
//                         type: amount >= 0 ? "addition" : "deduction"
//                     });
//                 }
//             });
//         }

//         const netAdjustments = positiveAdjustments + negativeAdjustments;

//         res.json({
//             subtotal: subtotal.toFixed(2),
//             adjustments: {
//                 additions: positiveAdjustments.toFixed(2),
//                 deductions: negativeAdjustments.toFixed(2),
//                 net: netAdjustments.toFixed(2)
//             },
//             totalAmount: total.toFixed(2),
//             reconciliation: {
//                 computedTotal: (subtotal + netAdjustments).toFixed(2),
//                 matches: Math.abs((subtotal + netAdjustments) - total) < 0.01
//             },
//             breakdown: adjustmentsList
//         });

//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// app.listen(3000, () => {
//     console.log("Server running on port 3000");
// });

//****************************SALE ROUTES*************************************** */
// salesRoutes.use(verifyApiKeyOrJwt);
// salesRoutes.get('/',);
// salesRoutes.post('/', );
// salesRoutes.get('/dashboardData',dashboardData)
// import { asyncHandler } from '../../middlewares/async-handler.js';
// import { authorize } from '../../middlewares/authorization.js';
// import { verifyApiKeyOrJwt } from '../auth/auth.middleware.js';
// import { createSalesRecord, getSales } from './sales.controller.js';

//****************************SALE REPOSITORY***************************************** */
// const getPOWithPartyDetails = async () => {
//   const conn = await db.getConnection();
//   try {
//     const [rows] = await conn.query(`
//       SELECT 
//         i.uuid AS voucher_id,
//         i.voucher_number,
//         i.voucher_date,
//         i.total_amount,
//         i.effective_date,
//         i.party_gstin,
//         i.company_gstin,
//         i.place_of_supply,
//         i.state_name,
//         p.party_type,
//         p.name,
//         p.mailing_name,
//         p.gstin,
//         p.gst_registration_type,
//         p.state,
//         p.country,
//         a.address_type,
//         a.address_line,
//         a.line_number
//       FROM vouchers i
//       LEFT JOIN voucher_parties p ON i.id = p.voucher_id
//       LEFT JOIN voucher_addresses a 
//         ON i.id = a.voucher_id 
//         AND p.party_type = a.address_type   
//         where i.voucher_type = 'Purchase Order'
//       ORDER BY i.voucher_date DESC, a.line_number ASC
//     `);
//     const map = new Map();
//     for (const r of rows) {
//       if (!map.has(r.voucher_id)) {
//         map.set(r.voucher_id, {
//           voucher_id: r.voucher_id,
//           voucher_number: r.voucher_number,
//           voucher_date: r.voucher_date,
//           total_amount: r.total_amount,
//           party_gstin: r.party_gstin,
//           company_gstin: r.company_gstin,
//           place_of_supply: r.place_of_supply,
//           state: r.state_name,
//           buyer: null,
//           consignee: null
//         });
//       }
//       const inv = map.get(r.voucher_id);
//       //  BUYER
//       if (r.party_type === 'BUYER') {
//         if (!inv.buyer) {
//           inv.buyer = {
//             name: r.name,
//             mailing_name: r.mailing_name,
//             gstin: r.gstin,
//             gst_registration_type: r.gst_registration_type,
//             state: r.state,
//             country: r.country,
//             address: new Set()
//           };
//         }
//         if (r.address_line) {
//           inv.buyer.address.add(r.address_line);
//         }
//       }
//       //  CONSIGNEE
//       if (r.party_type === 'CONSIGNEE') {
//         if (!inv.consignee) {
//           inv.consignee = {
//             name: r.name,
//             mailing_name: r.mailing_name,
//             gstin: r.gstin,
//             gst_registration_type: r.gst_registration_type,
//             state: r.state,
//             country: r.country,
//             address: new Set()
//           };
//         }
//         if (r.address_line) {
//           inv.consignee.address.add(r.address_line);
//         }
//       }
//     }

//     return Array.from(map.values()).map(inv => ({
//       ...inv,
//       buyer: inv.buyer
//         ? { ...inv.buyer, address: Array.from(inv.buyer.address) }
//         : null,
//       consignee: inv.consignee
//         ? { ...inv.consignee, address: Array.from(inv.consignee.address) }
//         : null
//     }));

//   } finally {
//     conn.release();
//   }
// };
// export const getFlatVouchersReport = async () => {
//   const conn = await db.getConnection();
//   const newFlatSql = ` SELECT 
//         i.uuid AS voucher_id,
//         i.voucher_number,
//         i.voucher_date,
//         i.party_name,
//         i.total_amount,
//         i.place_of_supply,
//         i.state_name,
//         i.cmpstate,
//         i.consigneestate,
//         itm.stock_item_name,
//         itm.hsn_code,
//         itm.quantity AS quantity,
//         itm.unit,
//         itm.rate AS rate,
//         itm.inclvatrate,
//         itm.discount,
//         itm.amount AS amount,
//         itm.gst_rate as gstRate,
//         ROUND((itm.amount * (itm.gst_rate/100)),2) as gstAmount, 
//         buyer.name AS buyer_name,
//         buyer.gstin AS buyer_gstin,
//         consignee.name AS consignee_name,
//         GROUP_CONCAT(DISTINCT le.ledger_name) AS ledgers,
//         SUM(le.amount) AS total_ledger_amount,
//         GROUP_CONCAT(DISTINCT gst.tax_type) AS gst_types
//         FROM vouchers i
//         LEFT JOIN purchase_items itm    ON i.id = itm.voucher_id
//         LEFT JOIN voucher_parties buyer  ON i.id = buyer.voucher_id  AND buyer.party_type = 'BUYER'
//         LEFT JOIN voucher_parties consignee  ON i.id = consignee.voucher_id AND consignee.party_type = 'CONSIGNEE'
//         LEFT JOIN voucher_ledger_entries le ON i.id = le.voucher_id
//         LEFT JOIN voucher_gst_details gst ON i.id = gst.voucher_id
//         where i.voucher_type="Purchase"
//         GROUP BY  i.uuid, itm.stock_item_name, itm.hsn_code, itm.unit, buyer.name, consignee.name ORDER BY i.voucher_date DESC`
//   try {
//     const [rows] = await conn.query(newFlatSql);
//     return rows;
//   } finally {
//     conn.release();
//   }
// };
    // if (!accessibleDistributorIds || accessibleDistributorIds.length === 0) {
      //   return [];
      // }

      // const placeholders = accessibleDistributorIds.map(() => '?').join(',');
// export const getVouchersWithPartyDetails = async () => {
//   const conn = await db.getConnection();
//   try {
//     const [rows] = await conn.query(`
//         SELECT 
//         i.uuid AS voucher_id,
//         i.voucher_number,
//         i.voucher_date,
//         i.total_amount,
//         i.effective_date,
//         i.party_gstin,
//         i.company_gstin,
//         i.place_of_supply,
//         i.state_name,
//         p.party_type,
//         p.name,
//         p.mailing_name,
//         p.gstin,
//         p.gst_registration_type,
//         p.state,
//         p.country,
//         a.address_type,
//         a.address_line,
//         a.line_number
//       FROM vouchers i
//       LEFT JOIN voucher_parties p ON i.id = p.voucher_id
//       LEFT JOIN voucher_addresses a 
//         ON i.id = a.voucher_id 
//         AND p.party_type = a.address_type   
//         where i.voucher_type = 'Purchase'
//       ORDER BY i.voucher_date DESC, a.line_number ASC
//     `);
  
//     const map = new Map();
//     for (const r of rows) {
//       if (!map.has(r.voucher_id)) {
//         map.set(r.voucher_id, {
//           voucher_id: r.voucher_id,
//           voucher_number: r.voucher_number,
//           voucher_date: r.voucher_date,
//           total_amount: r.total_amount,
//           party_gstin: r.party_gstin,
//           company_gstin: r.company_gstin,
//           place_of_supply: r.place_of_supply,
//           state: r.state_name,
//           buyer: null,
//           consignee: null
//         });
//       }
//       const inv = map.get(r.voucher_id);
//       //  BUYER
//       if (r.party_type === 'BUYER') {
//         if (!inv.buyer) {
//           inv.buyer = {
//             name: r.name,
//             mailing_name: r.mailing_name,
//             gstin: r.gstin,
//             gst_registration_type: r.gst_registration_type,
//             state: r.state,
//             country: r.country,
//             address: new Set()
//           };
//         }
//         if (r.address_line) {
//           inv.buyer.address.add(r.address_line);
//         }
//       }
//       //  CONSIGNEE
//       if (r.party_type === 'CONSIGNEE') {
//         if (!inv.consignee) {
//           inv.consignee = {
//             name: r.name,
//             mailing_name: r.mailing_name,
//             gstin: r.gstin,
//             gst_registration_type: r.gst_registration_type,
//             state: r.state,
//             country: r.country,
//             address: new Set()
//           };
//         }
//         if (r.address_line) {
//           inv.consignee.address.add(r.address_line);
//         }
//       }
//     }

//     return Array.from(map.values()).map(inv => ({
//       ...inv,
//       buyer: inv.buyer
//         ? { ...inv.buyer, address: Array.from(inv.buyer.address) }
//         : null,
//       consignee: inv.consignee
//         ? { ...inv.consignee, address: Array.from(inv.consignee.address) }
//         : null
//     }));

//   } finally {
//     conn.release();
//   }
// };

// export const getFullVoucherView = async (voucherId) => {
//   const conn = await db.getConnection();
//   try {
//     //  PARALLEL QUERIES
//     const [
//       [voucherRows],
//       [partyRows],
//       [addressRows],
//       [itemRows],
//       [ledgerRows],
//       [gstRows]
//     ] = await Promise.all([
//       conn.query(`SELECT * FROM vouchers WHERE uuid = ?`, [voucherId]),
//       conn.query(`SELECT * FROM voucher_parties WHERE voucher_uuid = ?`, [voucherId]),
//       conn.query(`SELECT * FROM voucher_addresses WHERE voucher_uuid = ? ORDER BY line_number`, [voucherId]),
//       conn.query(`SELECT * FROM purchase_items WHERE voucher_uuid = ?`, [voucherId]),
//       conn.query(`SELECT * FROM voucher_ledger_entries WHERE voucher_uuid = ? and is_party_ledger = false `, [voucherId]),
//       conn.query(`SELECT * FROM voucher_gst_details WHERE voucher_uuid = ?`, [voucherId])
//     ]);
//     const voucher = voucherRows[0];
//     if (!voucher) return null;
//     //  PARTY MAPPING
//     let buyer = null;
//     let consignee = null;
//     for (const p of partyRows) {
//       if (p.party_type === 'BUYER') {
//         buyer = {
//           name: p.name,
//           mailing_name: p.mailing_name,
//           gstin: p.gstin,
//           gst_registration_type: p.gst_registration_type,
//           state: p.state,
//           country: p.country,
//           address: []
//         };
//       }
//       if (p.party_type === 'CONSIGNEE') {
//         consignee = {
//           name: p.name,
//           mailing_name: p.mailing_name,
//           gstin: p.gstin,
//           gst_registration_type: p.gst_registration_type,
//           state: p.state,
//           country: p.country,
//           address: []
//         };
//       }
//     }

//     // ADDRESS MAPPING
//     for (const a of addressRows) {
//       if (a.address_type === 'BUYER' && buyer) {
//         buyer.address.push(a.address_line);
//       }
//       if (a.address_type === 'CONSIGNEE' && consignee) {
//         consignee.address.push(a.address_line);
//       }
//     }
//     // ITEMS
//     const items = itemRows.map(i => ({
//       name: i.stock_item_name,
//       hsn_code: i.hsn_code,
//       quantity: i.quantity,
//       unit: i.unit,
//       rate: i.rate,
//       amount: i.amount,
//       billedqty: i.billedqty
//     }));
//     //  LEDGERS
//     const ledgers = ledgerRows.map(l => ({
//       name: l.ledger_name,
//       amount: l.amount,
//       type: l.entry_type,
//       is_party_ledger: l.is_party_ledger
//     }));
//     //  GST
//     const gst = gstRows.map(g => ({
//       registration_name: g.registration_name,
//       tax_type: g.tax_type,
//       gstin: g.gstin,
//       state: g.state
//     }));
//     //  FINAL RESPONSE
//     return {
//       voucher: {
//         voucher_id: voucher.uuid,
//         voucher_number: voucher.voucher_number,
//         voucher_date: voucher.voucher_date,
//         effective_date: voucher.effective_date,
//         party_name: voucher.party_name,
//         party_ledger_name: voucher.party_ledger_name,
//         party_gstin: voucher.party_gstin,
//         company_gstin: voucher.company_gstin,
//         place_of_supply: voucher.place_of_supply,
//         state_name: voucher.state_name,
//         narration: voucher.narration,
//         total_amount: voucher.total_amount
//       },
//       buyer,
//       consignee,
//       items,
//       ledgers,
//       gst
//     };
//   } finally {
//     conn.release();
//   }
// };
/******************************** SALE SERVICES  *************************************** */
    // await conn.query(`DELETE FROM invoice_items WHERE invoice_uuid IN (?)`, [uuids]);
    // await conn.query(`DELETE FROM invoice_parties WHERE invoice_uuid IN (?)`, [uuids]);
    // await conn.query(`DELETE FROM invoice_addresses WHERE invoice_uuid IN (?)`, [uuids]);
    // await conn.query(`DELETE FROM invoice_gst_details WHERE invoice_uuid IN (?)`, [uuids]);
    // await conn.query(`DELETE FROM ledger_entries WHERE invoice_uuid IN (?)`, [uuids]);
    // await conn.query(`DELETE FROM cost_centre_allocations WHERE invoice_uuid IN (?)`, [uuids]);
    // await conn.query(`DELETE FROM bill_allocations WHERE invoice_uuid IN (?)`, [uuids]);

    // If batch_allocations is NOT FK-cascaded, uncomment:
    // await conn.query(`DELETE FROM batch_allocations WHERE item_uuid IN (SELECT uuid FROM invoice_items WHERE invoice_uuid IN (?))`, [uuids]);


    // ========================
    // STEP 6: BUILD ALL CHILD DATA

// export const createBulkSales = async (payload) => {
//   const conn = await db.getConnection();
//   try {
//     await conn.beginTransaction();
//     const vouchers = payload['sales vouchers'] || [];
//     const invoiceRows = [];
//     const partyRows = [];
//     const addressRows = [];
//     const gstRows = [];
//     const itemRows = [];
//     const batchRows = [];
//     const ledgerRows = [];
//     const masterIds = [];
//     const invoiceMap = new Map();
//     const stockMap = new Map();
//     const ledgerMap = new Map();
//     let subtotal = 0;
//     let total = 0;
//     let positiveAdjustments = 0;
//     let negativeAdjustments = 0;
//     let adjustmentsList = [];
//     // STEP 1: COLLECT UNIQUE DATA

//     for (let v of vouchers) {
//       v = normalizeVoucher(v);
//       for (const item of v.allinventoryentries || []) {
//         subtotal = (v.allinventoryentries || []).reduce(
//           (s, i) => s + parseFloat(i.amount || 0),
//           0
//         );
//         if (!stockMap.has(item.stockitemname)) {
//           stockMap.set(item.stockitemname, {
//             name: item.stockitemname,
//             hsn: item.gsthsnname,
//             unit: parseQty(item.actualqty).unit,
//             taxability: item.gstovrdntaxability || 'Taxable'
//           });
//         }
//       }
//       for (const l of v.ledgerentries || []) {
//         if (!ledgerMap.has(l.ledgername)) {
//           ledgerMap.set(l.ledgername, {
//             name: l.ledgername,
//             type: l.ispartyledger ? 'CUSTOMER' : 'GENERAL'
//           });
//         }


//         const amount = parseFloat(l?.amount || 0);
//         if (l?.ispartyledger) {
//           total = Math.abs(amount);
//         } else {
//           // classify only by sign
//           if (amount >= 0) {
//             positiveAdjustments += amount;
//           } else {
//             negativeAdjustments += amount;
//           }
//           adjustmentsList.push({
//             amount: amount,
//             type: amount >= 0 ? "addition" : "deduction"
//           });
//         }
//       }
//       const netAdjustments = positiveAdjustments + negativeAdjustments;
//       // STEP 2: BULK UPSERT
//       const stockIdMap = await bulkUpsertStockItems(conn, stockMap);
//       const ledgerIdMap = await bulkUpsertLedgers(conn, ledgerMap);
//       // STEP 3: PROCESS DATA
//       for (let v of vouchers) {
//         v = normalizeVoucher(v);
//         console.log(v.guid)
//         const invoiceUUID = nanoid();
//         invoiceMap.set(v.guid, invoiceUUID);
//         invoiceRows.push([
//           invoiceUUID,
//           v.guid,
//           v.vouchernumber,
//           v.vouchertypename,
//           formatDate(v.date),
//           formatDate(v.effectivedate),
//           v.partyname,
//           v.partyledgername,
//           v.partygstin || null,
//           v.cmpgstin || null,
//           v.placeofsupply,
//           v.statename,
//           v.narration || null,
//           subtotal,
//           total,
//           v.enteredby
//         ]);
//         masterIds.push(v.masterid)
//         // PARTY (FIXED)
//         // BUYER
//         partyRows.push([
//           invoiceUUID,
//           'BUYER',
//           v.basicbuyername || v.partyname,
//           v.partymailingname,
//           v.partygstin || null,
//           v.cmpgstregistrationtype || null,
//           v.statename || null,
//           v.countryofresidence || null,
//           v.partypincode || null,
//           null,
//           v.basicbasepartyname || null
//         ]);

//         // CONSIGNEE
//         if (v.consigneemailingname) {
//           partyRows.push([
//             invoiceUUID,
//             'CONSIGNEE',
//             v.consigneemailingname,
//             v.consigneemailingname,
//             v.consigneegstin || null,
//             null,
//             v.consigneestatename || null,
//             v.consigneecountryname || null,
//             v.consigneepincode || null,
//             v.consigneepinnumber || null,
//             null
//           ]);
//         }

//         // ADDRESSES (FIXED)
//         // BUYER
//         processAddress(v.basicbuyeraddress, 'BUYER', invoiceUUID, addressRows);
//         // CONSIGNEE
//         processAddress(v.address, 'CONSIGNEE', invoiceUUID, addressRows);
//         // DISPATCH
//         processAddress(v.dispatchfromaddress, 'DISPATCH_FROM', invoiceUUID, addressRows);
//         // FALLBACK (if consignee missing)
//         if (!v.address && v.basicbuyeraddress) {
//           processAddress(v.basicbuyeraddress, 'CONSIGNEE', invoiceUUID, addressRows);
//         }

//         // GST
//         if (v.gstregistration) {
//           gstRows.push([
//             invoiceUUID,
//             v.gstregistration.value,
//             v.gstregistration.taxtype,
//             v.gstregistration.taxregistration,
//             v.statename
//           ]);
//         }

//         // ITEMS

//         for (const item of v.allinventoryentries || []) {
//           const stockId = stockIdMap.get(item.stockitemname);
//           const itemUUID = nanoid();
//           const { qty, unit } = parseQty(item.actualqty);
//           itemRows.push([
//             itemUUID,
//             invoiceUUID,
//             stockId,
//             item.stockitemname,
//             item.gsthsnname,
//             qty,
//             unit,
//             parseRate(item.rate),
//             item.discount ? parseFloat(item?.discount) : null,
//             parseFloat(item.amount),
//             qty,
//             item.mrprate ? parseRate(item.mrprate) : null,
//             item.inclvatrate ? parseRate(item.inclvatrate) : null
//           ]);

//           for (const b of item.batchallocations || []) {
//             batchRows.push([
//               itemUUID,
//               b.godownname,
//               b.batchname,
//               parseQty(b.actualqty).qty,
//               parseRate(b.inclvatrate),
//               parseFloat(b.amount)
//             ]);
//           }
//         }

//         // LEDGER
//         for (const l of v.ledgerentries || []) {
//           const ledgerId = ledgerIdMap.get(l.ledgername);
//           ledgerRows.push([
//             invoiceUUID,
//             ledgerId,
//             l.ledgername,
//             parseFloat(l.amount ?? 0.00),
//             l.isdeemedpositive ? 'DEBIT' : 'CREDIT',
//             l.ispartyledger
//           ]);
//         }
//       }
//       // FINAL INSERT

//       await insertInvoicesBulk(conn, invoiceRows);
//       if (partyRows.length) await insertPartiesBulk(conn, partyRows);
//       if (addressRows.length) await insertAddressesBulk(conn, addressRows);
//       if (gstRows.length) await insertGSTBulk(conn, gstRows);
//       if (itemRows.length) await insertItemsBulk(conn, itemRows);
//       if (batchRows.length) await insertBatchBulk(conn, batchRows);
//       if (ledgerRows.length) await insertLedgerEntriesBulk(conn, ledgerRows);

//       await conn.commit();
//       return { success: true, count: vouchers.length, masters: masterIds };
//     }

//   }
//   catch (err) {
//     await conn.rollback();
//     throw err;
//   } finally {
//     conn.release();
//   }
// };

// GET sales

// export const createBulkSales = async (payload) => {
//   const conn = await db.getConnection();

//   try {
//     await conn.beginTransaction();

//     const vouchers = payload['sales vouchers'] || [];

//     const invoiceRows = [];
//     const partyRows = [];
//     const addressRows = [];
//     const gstRows = [];
//     const itemRows = [];
//     const batchRows = [];
//     const ledgerRows = [];
//     const masterIds = [];

//     const stockMap = new Map();
//     const ledgerMap = new Map();

//     // ========================
//     // STEP 1: COLLECT MASTERS
//     // ========================
//     for (let v of vouchers) {
//       v = normalizeVoucher(v);

//       for (const item of v.allinventoryentries || []) {
//         if (!stockMap.has(item.stockitemname)) {
//           stockMap.set(item.stockitemname, {
//             name: item.stockitemname,
//             hsn: item.gsthsnname,
//             unit: parseQty(item.actualqty).unit,
//             taxability: item.gstovrdntaxability || 'Taxable'
//           });
//         }
//       }

//       for (const l of v.ledgerentries || []) {
//         if (!ledgerMap.has(l.ledgername)) {
//           ledgerMap.set(l.ledgername, {
//             name: l.ledgername,
//             type: l.ispartyledger ? 'CUSTOMER' : 'GENERAL'
//           });
//         }
//       }
//     }

//     // ========================
//     // STEP 2: UPSERT MASTERS
//     // ========================
//     const stockIdMap = await bulkUpsertStockItems(conn, stockMap);
//     const ledgerIdMap = await bulkUpsertLedgers(conn, ledgerMap);

//     // ========================
//     // STEP 3: PREPARE INVOICES
//     // ========================
//     for (let v of vouchers) {
//       v = normalizeVoucher(v);

//       let subtotal = 0;
//       let total = 0;

//       subtotal = (v.allinventoryentries || []).reduce(
//         (s, i) => s + parseFloat(i.amount || 0),
//         0
//       );

//       for (const l of v.ledgerentries || []) {
//         if (l.ispartyledger) {
//           total = Math.abs(parseFloat(l.amount || 0));
//         }
//       }

//       invoiceRows.push([
//         nanoid(), // temporary UUID (may be ignored if duplicate guid)
//         v.guid,
//         v.vouchernumber,
//         v.vouchertypename,
//         formatDate(v.date),
//         formatDate(v.effectivedate),
//         v.partyname,
//         v.partyledgername,
//         v.partygstin || null,
//         v.cmpgstin || null,
//         v.placeofsupply,
//         v.statename,
//         v.narration || null,
//         subtotal,
//         total,
//         v.enteredby
//       ]);

//       masterIds.push(v.masterid);
//     }

//     // ========================
//     // STEP 4: INSERT INVOICES
//     // ========================
//     await insertInvoicesBulk(conn, invoiceRows);

//     // ========================
//     // STEP 5: FETCH REAL UUIDs
//     // ========================
//     const [rows] = await conn.query(
//       `SELECT guid, uuid FROM invoices WHERE guid IN (?)`,
//       [vouchers.map(v => v.guid)]
//     );

//     const invoiceMap = new Map(rows.map(r => [r.guid, r.uuid]));

//     // ========================
//     // STEP 6: PROCESS CHILD DATA
//     // ========================
//     for (let v of vouchers) {
//       v = normalizeVoucher(v);

//       const invoiceUUID = invoiceMap.get(v.guid);

//       // PARTY
//       partyRows.push([
//         invoiceUUID,
//         'BUYER',
//         v.basicbuyername || v.partyname,
//         v.partymailingname,
//         v.partygstin || null,
//         v.cmpgstregistrationtype || null,
//         v.statename || null,
//         v.countryofresidence || null,
//         v.partypincode || null,
//         null,
//         v.basicbasepartyname || null
//       ]);

//       if (v.consigneemailingname) {
//         partyRows.push([
//           invoiceUUID,
//           'CONSIGNEE',
//           v.consigneemailingname,
//           v.consigneemailingname,
//           v.consigneegstin || null,
//           null,
//           v.consigneestatename || null,
//           v.consigneecountryname || null,
//           v.consigneepincode || null,
//           v.consigneepinnumber || null,
//           null
//         ]);
//       }

//       processAddress(v.basicbuyeraddress, 'BUYER', invoiceUUID, addressRows);
//       processAddress(v.address, 'CONSIGNEE', invoiceUUID, addressRows);
//       processAddress(v.dispatchfromaddress, 'DISPATCH_FROM', invoiceUUID, addressRows);

//       if (!v.address && v.basicbuyeraddress) {
//         processAddress(v.basicbuyeraddress, 'CONSIGNEE', invoiceUUID, addressRows);
//       }

//       if (v.gstregistration) {
//         gstRows.push([
//           invoiceUUID,
//           v.gstregistration.value,
//           v.gstregistration.taxtype,
//           v.gstregistration.taxregistration,
//           v.statename
//         ]);
//       }

//       // ITEMS
//       for (const item of v.allinventoryentries || []) {
//         const stockId = stockIdMap.get(item.stockitemname);
//         const itemUUID = nanoid();
//         const { qty, unit } = parseQty(item.actualqty);

//         itemRows.push([
//           itemUUID,
//           invoiceUUID,
//           stockId,
//           item.stockitemname,
//           item.gsthsnname,
//           qty,
//           unit,
//           parseRate(item.rate),
//           item.discount ? parseFloat(item.discount) : null,
//           parseFloat(item.amount),
//           qty,
//           item.mrprate ? parseRate(item.mrprate) : null,
//           item.inclvatrate ? parseRate(item.inclvatrate) : null
//         ]);

//         for (const b of item.batchallocations || []) {
//           batchRows.push([
//             itemUUID,
//             b.godownname,
//             b.batchname,
//             parseQty(b.actualqty).qty,
//             parseRate(b.inclvatrate),
//             parseFloat(b.amount)
//           ]);
//         }
//       }

//       // LEDGER
//       for (const l of v.ledgerentries || []) {
//         const ledgerId = ledgerIdMap.get(l.ledgername);

//         ledgerRows.push([
//           invoiceUUID,
//           ledgerId,
//           l.ledgername,
//           parseFloat(l.amount ?? 0.0),
//           l.isdeemedpositive ? 'DEBIT' : 'CREDIT',
//           l.ispartyledger
//         ]);
//       }
//     }

//     // ========================
//     // STEP 7: INSERT CHILD DATA
//     // ========================
//     if (partyRows.length) await insertPartiesBulk(conn, partyRows);
//     if (addressRows.length) await insertAddressesBulk(conn, addressRows);
//     if (gstRows.length) await insertGSTBulk(conn, gstRows);
//     if (itemRows.length) await insertItemsBulk(conn, itemRows);
//     if (batchRows.length) await insertBatchBulk(conn, batchRows);
//     if (ledgerRows.length) await insertLedgerEntriesBulk(conn, ledgerRows);

//     await conn.commit();

//     return {
//       success: true,
//       count: vouchers.length,
//       masters: masterIds
//     };

//   } catch (err) {
//     await conn.rollback();
//     throw err;
//   } finally {
//     conn.release();
//   }
// };

// export const createBulkSales = async (payload) => {
//   const conn = await db.getConnection();

//   try {
//     await conn.beginTransaction();

//     const vouchers = payload['sales vouchers'] || [];

//     const invoiceRows = [];
//     const partyRows = [];
//     const addressRows = [];
//     const gstRows = [];
//     const itemRows = [];
//     const batchRows = [];
//     const ledgerRows = [];
//     const masterIds = [];

//     const stockMap = new Map();
//     const ledgerMap = new Map();

//     // ========================
//     // STEP 1: COLLECT MASTERS
//     // ========================
//     for (let v of vouchers) {
//       v = normalizeVoucher(v);

//       for (const item of v.allinventoryentries || []) {
//         if (!stockMap.has(item.stockitemname)) {
//           stockMap.set(item.stockitemname, {
//             name: item.stockitemname,
//             hsn: item.gsthsnname,
//             unit: parseQty(item.actualqty).unit,
//             taxability: item.gstovrdntaxability || 'Taxable'
//           });
//         }
//       }

//       for (const l of v.ledgerentries || []) {
//         if (!ledgerMap.has(l.ledgername)) {
//           ledgerMap.set(l.ledgername, {
//             name: l.ledgername,
//             type: l.ispartyledger ? 'CUSTOMER' : 'GENERAL'
//           });
//         }
//       }
//     }

//     const stockIdMap = await bulkUpsertStockItems(conn, stockMap);
//     const ledgerIdMap = await bulkUpsertLedgers(conn, ledgerMap);

//     // ========================
//     // STEP 2: PREPARE INVOICES
//     // ========================
//     for (let v of vouchers) {
//       v = normalizeVoucher(v);

//       const subtotal = (v.allinventoryentries || []).reduce(
//         (s, i) => s + parseFloat(i.amount || 0),
//         0
//       );

//       let total = 0;
//       for (const l of v.ledgerentries || []) {
//         if (l.ispartyledger) {
//           total = Math.abs(parseFloat(l.amount || 0));
//         }
//       }

//       invoiceRows.push([
//         nanoid(), // temporary UUID
//         v.guid,
//         v.vouchernumber,
//         v.vouchertypename,
//         formatDate(v.date),
//         formatDate(v.effectivedate),
//         v.partyname,
//         v.partyledgername,
//         v.partygstin || null,
//         v.cmpgstin || null,
//         v.placeofsupply,
//         v.statename,
//         v.narration || null,
//         subtotal,
//         total,
//         v.enteredby
//       ]);

//       masterIds.push(v.masterid);
//     }

//     // ========================
//     // STEP 3: UPSERT INVOICES
//     // ========================
//     await insertInvoicesBulk(conn, invoiceRows);

//     // ========================
//     // STEP 4: FETCH REAL UUIDs
//     // ========================
//     const [rows] = await conn.query(
//       `SELECT guid, uuid FROM invoices WHERE guid IN (?)`,
//       [vouchers.map(v => v.guid)]
//     );

//     const invoiceMap = new Map(rows.map(r => [r.guid, r.uuid]));
//     const uuids = Array.from(invoiceMap.values());

//     // ========================
//     // STEP 5: DELETE OLD DATA
//     // ========================
//     await conn.query(`DELETE FROM invoice_items WHERE invoice_uuid IN (?)`, [uuids]);
//     await conn.query(`DELETE FROM invoice_parties WHERE invoice_uuid IN (?)`, [uuids]);
//     await conn.query(`DELETE FROM invoice_addresses WHERE invoice_uuid IN (?)`, [uuids]);
//     await conn.query(`DELETE FROM invoice_gst_details WHERE invoice_uuid IN (?)`, [uuids]);
//     await conn.query(`DELETE FROM ledger_entries WHERE invoice_uuid IN (?)`, [uuids]);

//     // ========================
//     // STEP 6: BUILD CHILD DATA
//     // ========================
//     for (let v of vouchers) {
//       v = normalizeVoucher(v);

//       const invoiceUUID = invoiceMap.get(v.guid);

//       // PARTY
//       partyRows.push([
//         invoiceUUID,
//         'BUYER',
//         v.basicbuyername || v.partyname,
//         v.partymailingname,
//         v.partygstin || null,
//         v.cmpgstregistrationtype || null,
//         v.statename || null,
//         v.countryofresidence || null,
//         v.partypincode || null,
//         null,
//         v.basicbasepartyname || null
//       ]);

//       // ITEMS
//       for (const item of v.allinventoryentries || []) {
//         const stockId = stockIdMap.get(item.stockitemname);
//         const itemUUID = nanoid();
//         const { qty, unit } = parseQty(item.actualqty);

//         itemRows.push([
//           itemUUID,
//           invoiceUUID,
//           stockId,
//           item.stockitemname,
//           item.gsthsnname,
//           qty,
//           unit,
//           parseRate(item.rate),
//           item.discount ? parseFloat(item.discount) : null,
//           parseFloat(item.amount),
//           qty,
//           item.mrprate ? parseRate(item.mrprate) : null,
//           item.inclvatrate ? parseRate(item.inclvatrate) : null
//         ]);

//         for (const b of item.batchallocations || []) {
//           batchRows.push([
//             itemUUID,
//             b.godownname,
//             b.batchname,
//             parseQty(b.actualqty).qty,
//             parseRate(b.inclvatrate),
//             parseFloat(b.amount)
//           ]);
//         }
//       }

//       // LEDGER
//       for (const l of v.ledgerentries || []) {
//         const ledgerId = ledgerIdMap.get(l.ledgername);

//         ledgerRows.push([
//           invoiceUUID,
//           ledgerId,
//           l.ledgername,
//           parseFloat(l.amount ?? 0),
//           l.isdeemedpositive ? 'DEBIT' : 'CREDIT',
//           l.ispartyledger
//         ]);
//       }
//     }

//     // ========================
//     // STEP 7: BULK INSERT CHILD
//     // ========================
//     if (partyRows.length) await insertPartiesBulk(conn, partyRows);
//     if (itemRows.length) await insertItemsBulk(conn, itemRows);
//     if (batchRows.length) await insertBatchBulk(conn, batchRows);
//     if (ledgerRows.length) await insertLedgerEntriesBulk(conn, ledgerRows);

//     await conn.commit();

//     return {
//       success: true,
//       count: vouchers.length,
//       masters: masterIds
//     };

//   } catch (err) {
//     await conn.rollback();
//     throw err;
//   } finally {
//     conn.release();
//   }
// };
// // import { findSaleByIdAndCompany,findSalesByCompany,insertSale
// // } from '../../models/sale.model.js';
// // import { AppError } from '../../shared/app-error.js';

// // export async function getSalesByCompany(companyId, filters) {
// //   return findSalesByCompany(companyId, filters);
// // }

// // export async function createSale({
// //   companyId,
// //   userId,
// //   distributorCompanyId = null,
// //   title,
// //   amount,
// //   zone,
// //   state,
// //   status
// // }) {
// //   const saleId = await insertSale({
// //     companyId,
// //     userId,
// //     distributorCompanyId,
// //     title,
// //     amount,
// //     zone,
// //     state,
// //     status
// //   });

// //   return getSaleById(saleId, companyId);
// // }

// // export async function getSaleById(saleId, companyId) {
// //   const sale = await findSaleByIdAndCompany(saleId, companyId);

// //   if (!sale) {
// //     throw new AppError('Sale not found', 404);
// //   }

// //   return sale;
// // }
// import { db } from '../../config/database.js'
// import { nanoid } from 'nanoid'
// // import {
// //   findInvoiceByGuid,
// //   insertInvoice,
// //   findStockItem,
// //   insertStockItem,
// //   insertItem,
// //   insertBatch,
// //   findLedger,
// //   insertLedgerMaster,
// //   insertLedgerEntry
// // } from '../../models/sale.model.js';

// // // 🧠 Helpers
// // const parseQty = (str) => {
// //   if (!str) return { qty: 0, unit: null };
// //   const [qty, unit] = str.trim().split(' ');
// //   return { qty: parseFloat(qty), unit };
// // };

// // const parseRate = (str) => {
// //   if (!str) return 0;
// //   return parseFloat(str.split('/')[0]);
// // };

// // const formatDate = (d) =>
// //   `${d.substring(0, 4)}-${d.substring(4, 6)}-${d.substring(6, 8)}`;

// // // 🔁 Master Handling
// // const getOrCreateStock = async (conn, item) => {
// //   const existing = await findStockItem(conn, item.stockitemname);
// //   if (existing) return existing.id;

// //   const { unit } = parseQty(item.actualqty);

// //   return await insertStockItem(conn, {
// //     name: item.stockitemname,
// //     hsn_code: item.gsthsnname,
// //     unit,
// //     taxability: item.gstovrdntaxability || 'Taxable'
// //   });
// // };

// // const getOrCreateLedger = async (conn, ledger) => {
// //   const existing = await findLedger(conn, ledger.ledgername);
// //   if (existing) return existing.id;

// //   return await insertLedgerMaster(conn, {
// //     name: ledger.ledgername,
// //     type: ledger.ispartyledger ? 'CUSTOMER' : 'GENERAL'
// //   });
// // };

// // // 🚀 MAIN SERVICE
// // export const createSalesVoucher = async (data) => {
// //   const conn = await db.getConnection();

// //   try {
// //     await conn.beginTransaction();

// //     // ❗ Idempotency
// //     const exists = await findInvoiceByGuid(conn, data.guid);
// //     if (exists) {
// //       await conn.rollback();
// //       return { message: 'Already exists', id: exists.id };
// //     }

// //     // 💵 Total
// //     const total = (data.allinventoryentries || []).reduce(
// //       (sum, i) => sum + parseFloat(i.amount || 0),
// //       0
// //     );

// //     // 📄 Invoice Insert
// //     const invoiceId = await insertInvoice(conn, {
// //       guid: data.guid,
// //       voucher_number: data.vouchernumber,
// //       voucher_type: data.vouchertypename,
// //       invoice_date: formatDate(data.date),
// //       party_name: data.partyname,
// //       party_gstin: data.partygstin,
// //       company_gstin: data.cmpgstin,
// //       place_of_supply: data.placeofsupply,
// //       state_name: data.statename,
// //       narration: data.narration,
// //       total_amount: total,
// //       created_by: data.enteredby
// //     });

// //     // 📦 Items + Batch
// //     for (const item of data.allinventoryentries || []) {
// //       const stockId = await getOrCreateStock(conn, item);

// //       const { qty, unit } = parseQty(item.actualqty);
// //       const rate = parseRate(item.rate);

// //       const itemId = await insertItem(conn, {
// //         invoice_id: invoiceId,
// //         stock_item_id: stockId,
// //         stock_item_name: item.stockitemname,
// //         hsn_code: item.gsthsnname,
// //         quantity: qty,
// //         unit,
// //         rate,
// //         amount: parseFloat(item.amount),
// //         gst_taxability: item.gstovrdntaxability || 'Taxable',
// //         supply_type: item.gstovrdntypeofsupply || 'Goods'
// //       });

// //       for (const b of item.batchallocations || []) {
// //         const bQty = parseQty(b.actualqty);

// //         await insertBatch(conn, {
// //           item_id: itemId,
// //           godown_name: b.godownname,
// //           batch_name: b.batchname,
// //           quantity: bQty.qty,
// //           rate: parseRate(b.inclvatrate),
// //           amount: parseFloat(b.amount)
// //         });
// //       }
// //     }

// //     // 💰 Ledger
// //     for (const l of data.ledgerentries || []) {
// //       const ledgerId = await getOrCreateLedger(conn, l);

// //       await insertLedgerEntry(conn, {
// //         invoice_id: invoiceId,
// //         ledger_id: ledgerId,
// //         ledger_name: l.ledgername,
// //         amount: Math.abs(parseFloat(l.amount)),
// //         entry_type: l.isdeemedpositive ? 'CREDIT' : 'DEBIT',
// //         is_party_ledger: l.ispartyledger
// //       });
// //     }

// //     await conn.commit();

// //     return { message: 'Created', id: invoiceId };

// //   } catch (err) {
// //     await conn.rollback();
// //     throw err;
// //   } finally {
// //     conn.release();
// //   }
// // };

// import {
//   insertInvoicesBulk,
//   upsertStockItem,
//   upsertLedger,
//   insertItemsBulk,
//   insertBatchBulk,
//   insertLedgerEntriesBulk,
//   getSalesModelData
// } from '../../models/sale.model.js';
// // ===============================
// // HELPERS
// // ===============================
// const parseQty = (str) => {

//   if (!str) return { qty: 0, unit: null };
//   const [q, u] = str.trim().split(' ');

//   return { qty: parseFloat(q), unit: u };
// };

// const parseRate = (str) => {
//   if (!str) return 0;
//   return parseFloat(str.split('/')[0]);
// };

// const formatDate = (d) =>
//   `${d.substring(0, 4)}-${d.substring(4, 6)}-${d.substring(6, 8)}`;

// // ===============================
// // MAIN SERVICE
// // ===============================
// export const createBulkSales = async (payload) => {
//   const conn = await db.getConnection();

//   const stockCache = new Map();
//   const ledgerCache = new Map();

//   try {
//     await conn.beginTransaction();

//     const vouchers = payload.tallymessage || [];

//     if (!vouchers.length) {
//       throw new Error('No vouchers found');
//     }

//     // =========================
//     // INVOICES
//     // =========================
//     const invoiceRows = [];
//     const invoiceMap = new Map();
//     const addressRows = [];

//     for (const v of vouchers) {
//       const invoiceUUID = nanoid();
//       invoiceMap.set(v.guid, invoiceUUID);

//       const total = (v.allinventoryentries || []).reduce(
//         (s, i) => s + parseFloat(i.amount || 0),
//         0
//       );

//       invoiceRows.push([
//         invoiceUUID,
//         v.guid,
//         v.vouchernumber,
//         v.vouchertypename,
//         formatDate(v.date),
//         formatDate(v.effectivedate),
//         v.partyname,
//         v.partyledgername,
//         v.partygstin,
//         v.cmpgstin,
//         v.placeofsupply,
//         v.statename,
//         v.narration,
//         total,
//         v.enteredby
//       ]);
//     }

// const a = await insertInvoicesBulk(conn, invoiceRows);
// const partyRows = [];
// const addressRows = [];
// const gstRows = [];



// for (const v of vouchers) {
//   const voucherId = invoiceMap.get(v.guid);
//   // -------------------------------
//   // 🧾 1. PARTY ROWS (BUYER + CONSIGNEE)
//   // -------------------------------
//   // BUYER

//   partyRows.push([
//     voucherId,
//     'BUYER',
//     v.basicbuyername || v.partyname,
//     v.partymailingname,
//     v.partygstin,
//     v.cmpgstregistrationtype,
//     v.statename,
//     v.countryofresidence,
//     v.partypincode,
//     null, // pan_number (not available here)
//     v.basicbasepartyname
//   ]);

//   // CONSIGNEE
//   partyRows.push([
//     voucherId,
//     'CONSIGNEE',
//     v.consigneemailingname,
//     v.consigneemailingname,
//     v.consigneegstin,
//     null,
//     v.consigneestatename,
//     v.consigneecountryname,
//     v.consigneepincode,
//     v.consigneepinnumber,
//     null
//   ]);

// 
//   //  2. ADDRESS ROWS
//  

//   const processAddress = (arr, type) => {
//     if (!arr || !Array.isArray(arr)) return;

//     let lineNumber = 1;

//     for (let i = 1; i < arr.length; i++) { // skip metadata index 0
//       if (!arr[i]) continue;

//       addressRows.push([
//         voucherId,
//         type,
//         lineNumber++,
//         arr[i]
//       ]);
//     }
//   };


//   // BUYER ADDRESS
//   processAddress(v.basicbuyeraddress, 'BUYER');

//   // CONSIGNEE ADDRESS
//   processAddress(v.address, 'CONSIGNEE');

//   // DISPATCH FROM
//   processAddress(v.dispatchfromaddress, 'DISPATCH_FROM');

//   // -------------------------------
//   // 🧮 3. GST DETAILS
//   // -------------------------------

//   if (v.gstregistration) {
//     gstRows.push([
//       voucherId,
//       v.gstregistration.value,
//       v.gstregistration.taxtype,
//       v.gstregistration.taxregistration,
//       v.statename
//     ]);
//   }
// }

//     
//     // CHILD TABLES
//     
//     const itemRows = [];
//     const batchRows = [];
//     const ledgerRows = [];

//     for (const v of vouchers) {
//       const invoiceUUID = invoiceMap.get(v.guid);
//       // ITEMS
//       for (const item of v.allinventoryentries || []) {
//         let stockId;

//         if (stockCache.has(item.stockitemname)) {
//           stockId = stockCache.get(item.stockitemname);
//         } else {
//           stockId = await upsertStockItem(conn, {
//             name: item.stockitemname,
//             hsn: item.gsthsnname,
//             unit: parseQty(item.actualqty).unit,
//             taxability: item.gstovrdntaxability || 'Taxable'
//           });
//           stockCache.set(item.stockitemname, stockId);
//         }
//         const itemUUID = nanoid();
//         const { qty, unit } = parseQty(item.actualqty);
//         const { bqty, bunit } = parseQty(item.billedqty);
//         itemRows.push([
//           itemUUID,
//           invoiceUUID,
//           stockId,
//           item.stockitemname,
//           item.gsthsnname,
//           qty,
//           unit,
//           parseRate(item.rate),
//           parseFloat(item.amount),
//           bqty
//         ]);

//         // BATCH
//         for (const b of item.batchallocations || []) {
//           batchRows.push([
//             itemUUID,
//             b.godownname,
//             b.batchname,
//             parseQty(b.actualqty).qty,
//             parseRate(b.inclvatrate),
//             parseFloat(b.amount)
//           ]);
//         }
//       }

//       // LEDGER
//       for (const l of v.ledgerentries || []) {
//         let ledgerId;
//         if (ledgerCache.has(l.ledgername)) {
//           ledgerId = ledgerCache.get(l.ledgername);
//         } else {
//           ledgerId = await upsertLedger(conn, {
//             name: l.ledgername,
//             type: l.ispartyledger ? 'CUSTOMER' : 'GENERAL'
//           });
//           ledgerCache.set(l.ledgername, ledgerId);
//         }

//         ledgerRows.push([
//           invoiceUUID,
//           ledgerId,
//           l.ledgername,
//           parseFloat(l.amount ?? 0.00),
//           l.isdeemedpositive ? 'DEBIT' : 'CREDIT',
//           l.ispartyledger
//         ]);
//       }
//     }
//     // =========================
//     // BULK INSERT
//     // =========================
//     console.log(invoiceRows)
//     console.log(ledgerRows)
//     if (itemRows.length) await insertItemsBulk(conn, itemRows);
//     if (batchRows.length) await insertBatchBulk(conn, batchRows);
//     if (ledgerRows.length) await insertLedgerEntriesBulk(conn, ledgerRows);
//     await conn.commit();
//     return {
//       success: true,
//       message: 'Bulk sales inserted successfully',
//       count: vouchers.length
//     };
//   } catch (err) {
//     await conn.rollback();
//     throw err;
//   } finally {
//     conn.release();
//   }
// };

// export const getSalesServiceData = async () => {
//   return await getSalesModelData()
// }
// HELPERS

// const parseQty = (str) => {
//   if (!str) return { qty: 0, unit: null };
//   const [q, u] = str.trim().split(/\s+/);
//   return { qty: parseFloat(q) || 0, unit: u || null };
// };

// const parseRate = (str) => {
//   if (!str) return 0;
//   return parseFloat(str.split('/')[0]) || 0;
// };

// const formatDate = (d) =>
//   `${d.substring(0, 4)}-${d.substring(4, 6)}-${d.substring(6, 8)}`;

// // ADDRESS HELPER (FIXED)
// const processAddress = (arr, type, invoiceUUID, addressRows) => {
//   if (!arr || !Array.isArray(arr)) return;
//   let lineNumber = 1;
//   for (let i = 1; i < arr.length; i++) {
//     const line = arr[i];
//     if (!line || typeof line !== 'string') continue;
//     addressRows.push([
//       invoiceUUID,
//       type,
//       lineNumber++,
//       line.trim()
//     ]);
//   }
// };

// const chunkArray = (arr, size = 500) => {
//   const chunks = [];
//   for (let i = 0; i < arr.length; i += size) {
//     chunks.push(arr.slice(i, i + size));
//   }
//   return chunks;
// };
// const deleteAllTables = async (conn, uuids) => {
//   if (!uuids || uuids.length === 0) return;
//   const chunks = chunkArray(uuids, 500);
//   for (const chunk of chunks) {

//     // ========================
//     // STEP 1: DELETE DEEPEST CHILD (if NOT using FK cascade)
//     // ========================
//     await conn.query(`
//       DELETE FROM batch_allocations 
//       WHERE item_uuid IN (
//         SELECT uuid FROM invoice_items WHERE invoice_uuid IN (?)
//       )
//     `, [chunk]);

//     // ========================
//     // STEP 2: DELETE ITEMS
//     // ========================
//     await conn.query(
//       `DELETE FROM invoice_items WHERE invoice_uuid IN (?)`,
//       [chunk]
//     );

//     // ========================
//     // STEP 3: LEDGER + ACCOUNTING DIMENSIONS
//     // ========================
//     await conn.query(
//       `DELETE FROM ledger_entries WHERE invoice_uuid IN (?)`,
//       [chunk]
//     );

//     await conn.query(
//       `DELETE FROM cost_centre_allocations WHERE invoice_uuid IN (?)`,
//       [chunk]
//     );

//     await conn.query(
//       `DELETE FROM bill_allocations WHERE invoice_uuid IN (?)`,
//       [chunk]
//     );

//     // ========================
//     // STEP 4: PARTY + ADDRESS + GST
//     // ========================
//     await conn.query(
//       `DELETE FROM invoice_parties WHERE invoice_uuid IN (?)`,
//       [chunk]
//     );

//     await conn.query(
//       `DELETE FROM invoice_addresses WHERE invoice_uuid IN (?)`,
//       [chunk]
//     );

//     await conn.query(
//       `DELETE FROM invoice_gst_details WHERE invoice_uuid IN (?)`,
//       [chunk]
//     );
//   }
// };


// CREATE BULK SALES
// const deleteAllTables = async (conn, uuids) => {
//   if (!uuids.length) return;

//   const chunks = chunkArray(uuids, 500);

//   for (const chunk of chunks) {

//     // 🔥 DELETE IN STRICT ORDER

//     // Batch allocations
//     await conn.query(`
//       DELETE ba FROM batch_allocations ba
//       JOIN invoice_items ii ON ba.item_uuid = ii.uuid
//       WHERE ii.invoice_uuid IN (?)
//     `, [chunk]);

//     // Items
//     await conn.query(
//       `DELETE FROM invoice_items WHERE invoice_uuid IN (?)`,
//       [chunk]
//     );

//     // Ledger dependent
//     await conn.query(
//       `DELETE FROM cost_centre_allocations WHERE invoice_uuid IN (?)`,
//       [chunk]
//     );

//     await conn.query(
//       `DELETE FROM bill_allocations WHERE invoice_uuid IN (?)`,
//       [chunk]
//     );

//     await conn.query(
//       `DELETE FROM ledger_entries WHERE invoice_uuid IN (?)`,
//       [chunk]
//     );

//     // Party & address
//     await conn.query(
//       `DELETE FROM invoice_parties WHERE invoice_uuid IN (?)`,
//       [chunk]
//     );

//     await conn.query(
//       `DELETE FROM invoice_addresses WHERE invoice_uuid IN (?)`,
//       [chunk]
//     );

//     await conn.query(
//       `DELETE FROM invoice_gst_details WHERE invoice_uuid IN (?)`,
//       [chunk]
//     );
//   }
// };

// function normalizeVoucher(v) {
//   if (v.allinventoryentries && v.ledgerentries) {
//     return v;
//   }

//   const nv = { ...v };
//   if (v.allledgerentries) {
//     nv.ledgerentries = v.allledgerentries.map(l => {
//       const copy = { ...l };
//       if (l.inventoryallocations) {
//         nv.allinventoryentries = nv.allinventoryentries || [];
//         for (const inv of l.inventoryallocations) {
//           nv.allinventoryentries.push({
//             ...inv,
//             accountingallocations: [
//               {
//                 ledgername: l.ledgername,
//                 amount: inv.amount
//               }
//             ]
//           });
//         }
//       }
//       return copy;
//     });
//   }
//   nv.allinventoryentries = nv.allinventoryentries || [];
//   nv.ledgerentries = nv.ledgerentries || [];
//   return nv;
// }
//********************************************SALES MODEL***************************/
// export async function findSalesByCompany(companyId, filters = {}) {
//   const conditions = ['sales.company_id = ?'];
//   const values = [companyId];

//   if (filters.distributorCompanyId) {
//     conditions.push('sales.distributor_company_id = ?');
//     values.push(filters.distributorCompanyId);
//   }

//   if (filters.zone) {
//     conditions.push('sales.zone = ?');
//     values.push(filters.zone);
//   }

//   if (filters.state) {
//     conditions.push('sales.state = ?');
//     values.push(filters.state);
//   }

//   if (filters.salesmanId) {
//     conditions.push('sales.user_id = ?');
//     values.push(filters.salesmanId);
//   }

//   const sql = `
//     SELECT
//       sales.id,
//       sales.company_id,
//       sales.user_id,
//       sales.distributor_company_id,
//       sales.title,
//       sales.amount,
//       sales.zone,
//       sales.state,
//       sales.status,
//       sales.created_at,
//       sales.updated_at,
//       users.name AS user_name,
//       distributors.name AS distributor_name
//     FROM sales
//     INNER JOIN users ON users.id = sales.user_id
//     LEFT JOIN companies AS distributors ON distributors.id = sales.distributor_company_id
//     WHERE ${conditions.join(' AND ')}
//     ORDER BY sales.created_at DESC
//   `;

//   const [rows] = await db.execute(sql, values);

//   return rows;
// }

// export async function findSaleByIdAndCompany(saleId, companyId) {
//   const [rows] = await db.execute(
//     `
//       SELECT
//         id,
//         company_id,
//         user_id,
//         distributor_company_id,
//         title,
//         amount,
//         zone,
//         state,
//         status,
//         created_at,
//         updated_at
//       FROM sales
//       WHERE id = ? AND company_id = ?
//       LIMIT 1
//     `,
//     [saleId, companyId]
//   );

//   return rows[0] || null;
// }

// export async function insertSale({
//   companyId,
//   userId,
//   distributorCompanyId,
//   title,
//   amount,
//   zone,
//   state,
//   status
// }) {
//   const [result] = await db.execute(
//     `
//       INSERT INTO sales (company_id, user_id, distributor_company_id, title, amount, zone, state, status)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//     `,
//     [companyId, userId, distributorCompanyId, title, amount, zone, state, status]
//   );

//   return result.insertId;
// }
import { db } from '../config/database.js';

// 🔍 Invoice

// export const findInvoiceByGuid = async (conn, guid) => {
//   const [rows] = await conn.execute(
//     `SELECT id FROM invoices WHERE guid = ?`,
//     [guid]
//   );
//   return rows[0];
// };

// export const insertInvoice = async (conn, data) => {
//   const [result] = await conn.execute(
//     `INSERT INTO invoices
//     (guid, voucher_number, voucher_type, invoice_date, party_name, party_gstin, company_gstin, place_of_supply, state_name, narration, total_amount, created_by)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//     [
//       data.guid,
//       data.voucher_number,
//       data.voucher_type,
//       data.invoice_date,
//       data.party_name,
//       data.party_gstin,
//       data.company_gstin,
//       data.place_of_supply,
//       data.state_name,
//       data.narration,
//       data.total_amount,
//       data.created_by
//     ]
//   );

//   return result.insertId;
// };

// // 📦 Stock Master
// export const findStockItem = async (conn, name) => {
//   const [rows] = await conn.execute(
//     `SELECT id FROM stock_items WHERE name = ?`,
//     [name]
//   );
//   return rows[0];
// };

// export const insertStockItem = async (conn, item) => {
//   const [result] = await conn.execute(
//     `INSERT INTO stock_items (name, hsn_code, unit, gst_taxability)
//      VALUES (?, ?, ?, ?)`,
//     [item.name, item.hsn_code, item.unit, item.taxability]
//   );
//   return result.insertId;
// };

// // 📦 Invoice Items
// export const insertItem = async (conn, item) => {
//   const [result] = await conn.execute(
//     `INSERT INTO invoice_items
//     (invoice_id, stock_item_id, stock_item_name, hsn_code, quantity, unit, rate, amount, gst_taxability, supply_type)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//     [
//       item.invoice_id,
//       item.stock_item_id,
//       item.stock_item_name,
//       item.hsn_code,
//       item.quantity,
//       item.unit,
//       item.rate,
//       item.amount,
//       item.gst_taxability,
//       item.supply_type
//     ]
//   );
//   return result.insertId;
// };

// // 🏭 Batch
// export const insertBatch = async (conn, batch) => {
//   await conn.execute(
//     `INSERT INTO batch_allocations
//     (item_id, godown_name, batch_name, quantity, rate, amount)
//     VALUES (?, ?, ?, ?, ?, ?)`,
//     [
//       batch.item_id,
//       batch.godown_name,
//       batch.batch_name,
//       batch.quantity,
//       batch.rate,
//       batch.amount
//     ]
//   );
// };

// // 💰 Ledger Master
// export const findLedger = async (conn, name) => {
//   const [rows] = await conn.execute(
//     `SELECT id FROM ledgers WHERE name = ?`,
//     [name]
//   );
//   return rows[0];
// };

// export const insertLedgerMaster = async (conn, ledger) => {
//   const [result] = await conn.execute(
//     `INSERT INTO ledgers (name, ledger_type)
//      VALUES (?, ?)`,
//     [ledger.name, ledger.type]
//   );
//   return result.insertId;
// };

// // 💰 Ledger Entry
// export const insertLedgerEntry = async (conn, entry) => {
//   await conn.execute(
//     `INSERT INTO ledger_entries
//     (invoice_id, ledger_id, ledger_name, amount, entry_type, is_party_ledger)
//     VALUES (?, ?, ?, ?, ?, ?)`,
//     [
//       entry.invoice_id,
//       entry.ledger_id,
//       entry.ledger_name,
//       entry.amount,
//       entry.entry_type,
//       entry.is_party_ledger
//     ]
//   );
// };

// INVOICE

// export const findInvoiceByGuid = async (conn, guid) => {
//   const [rows] = await conn.execute(
//     `SELECT id FROM invoices WHERE guid = ?`,
//     [guid]
//   );
//   return rows[0];
// };

// export const insertInvoice = async (conn, data) => {
//   const [res] = await conn.execute(
//     `INSERT INTO invoices
//     (guid, voucher_number, voucher_type, invoice_date, party_name, party_gstin, company_gstin, place_of_supply, state_name, narration, total_amount, created_by)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//     [
//       data.guid,
//       data.voucher_number,
//       data.voucher_type,
//       data.invoice_date,
//       data.party_name,
//       data.party_gstin,
//       data.company_gstin,
//       data.place_of_supply,
//       data.state_name,
//       data.narration,
//       data.total_amount,
//       data.created_by
//     ]
//   );
//   return res.insertId;
// };

// // STOCK MASTER
// export const findStockItem = async (conn, name) => {
//   const [rows] = await conn.execute(
//     `SELECT id FROM stock_items WHERE name = ?`,
//     [name]
//   );
//   return rows[0];
// };

// export const insertStockItem = async (conn, item) => {
//   const [res] = await conn.execute(
//     `INSERT INTO stock_items (name, hsn_code, unit, gst_taxability)
//      VALUES (?, ?, ?, ?)`,
//     [item.name, item.hsn_code, item.unit, item.taxability]
//   );
//   return res.insertId;
// };

// // LEDGER MASTER
// export const findLedger = async (conn, name) => {
//   const [rows] = await conn.execute(
//     `SELECT id FROM ledgers WHERE name = ?`,
//     [name]
//   );
//   return rows[0];
// };

// export const insertLedgerMaster = async (conn, ledger) => {
//   const [res] = await conn.execute(
//     `INSERT INTO ledgers (name, ledger_type)
//      VALUES (?, ?)`,
//     [ledger.name, ledger.type]
//   );
//   return res.insertId;
// };

// // ITEM
// export const insertItem = async (conn, item) => {
//   const [res] = await conn.execute(
//     `INSERT INTO invoice_items
//     (invoice_id, stock_item_id, stock_item_name, hsn_code, quantity, unit, rate, amount)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//     [
//       item.invoice_id,
//       item.stock_item_id,
//       item.stock_item_name,
//       item.hsn_code,
//       item.quantity,
//       item.unit,
//       item.rate,
//       item.amount
//     ]
//   );
//   return res.insertId;
// };

// // BATCH
// export const insertBatch = async (conn, batch) => {
//   await conn.execute(
//     `INSERT INTO batch_allocations
//     (item_id, godown_name, batch_name, quantity, rate, amount)
//     VALUES (?, ?, ?, ?, ?, ?)`,
//     [
//       batch.item_id,
//       batch.godown_name,
//       batch.batch_name,
//       batch.quantity,
//       batch.rate,
//       batch.amount
//     ]
//   );
// };

// // LEDGER ENTRY
// export const insertLedgerEntry = async (conn, entry) => {
//   await conn.execute(
//     `INSERT INTO ledger_entries
//     (invoice_id, ledger_id, ledger_name, amount, entry_type)
//     VALUES (?, ?, ?, ?, ?)`,
//     [
//       entry.invoice_id,
//       entry.ledger_id,
//       entry.ledger_name,
//       entry.amount,
//       entry.entry_type
//     ]
//   );
// };



// ===============================
// INVOICES
// ===============================

// export const insertInvoicesBulk = async (conn, rows) => {
//   return conn.query(
//     `INSERT INTO invoices
//     (uuid, guid, voucher_number, voucher_type, invoice_date,effective_date, party_name,party_ledger_name, party_gstin, company_gstin, place_of_supply, state_name, narration, total_amount, created_by)
//     VALUES ?
//     ON DUPLICATE KEY UPDATE guid = guid`,
//     [rows]
//   );
// };

// // ===============================
// // STOCK ITEM (UPSERT)
// // ===============================
// export const upsertStockItem = async (conn, item) => {
//   const [res] = await conn.query(
//     `INSERT INTO stock_items (name, hsn_code, unit, gst_taxability)
//      VALUES (?, ?, ?, ?)
//      ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
//     [item.name, item.hsn, item.unit, item.taxability]
//   );
//   return res.insertId;
// };

// // ===============================
// // LEDGER (UPSERT)
// // ===============================
// export const upsertLedger = async (conn, ledger) => {
//   const [res] = await conn.query(
//     `INSERT INTO ledgers (name, ledger_type)
//      VALUES (?, ?)
//      ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
//     [ledger.name, ledger.type]
//   );
//   return res.insertId;
// };


// // ===============================
// // ITEMS BULK
// // ===============================
// export const insertItemsBulk = async (conn, rows) => {
//   return conn.query(
//     `INSERT INTO invoice_items
//     (uuid, invoice_uuid, stock_item_id, stock_item_name, hsn_code, quantity, unit, rate, amount,billedqty)
//     VALUES ?`,
//     [rows]
//   );
// };

// // ===============================
// // BATCH BULK
// // ===============================
// export const insertBatchBulk = async (conn, rows) => {
//   return conn.query(
//     `INSERT INTO batch_allocations
//     (item_uuid, godown_name, batch_name, quantity, rate, amount)
//     VALUES ?`,
//     [rows]
//   );
// };

// // ===============================
// // LEDGER ENTRIES BULK
// // ===============================
// export const insertLedgerEntriesBulk = async (conn, rows) => {
//   return conn.query(
//     `INSERT INTO ledger_entries
//     (invoice_uuid, ledger_id, ledger_name, amount, entry_type,is_party_ledger)
//     VALUES ?`,
//     [rows]
//   );
// };


// export const getSalesModelData = async () => {
//   const connection = await db.getConnection()
//   try {
//     await connection.beginTransaction()
//     const totalSalesSql = `SELECT sum(total_amount) as totalSalesAmount FROM invoices where  voucher_type = "Sales" GROUP by voucher_type `
//     const inventoryentriessql = `SELECT i.uuid as invoice_id, i.party_name, i.party_ledger_name AS outlet, i.invoice_date, i.place_of_supply, i.total_amount AS invoice_amount, itm.stock_item_name, itm.hsn_code, itm.quantity, itm.rate, itm.amount, itm.unit FROM invoices i JOIN invoice_items itm ON i.uuid = itm.invoice_uuid`
//     const ledgerentriessql = `SELECT i.uuid as invoice_id, i.party_name, le.ledger_name,le.amount,le.entry_type,le.is_party_ledger FROM invoices i JOIN ledger_entries le ON i.uuid = le.invoice_uuid`
//     const [totalSales] = await connection.execute(totalSalesSql)
//     const [inventoryentries] = await connection.execute(inventoryentriessql)
//     const [ledgerentries] = await connection.execute(ledgerentriessql)
//     return {
//       totalSales,
//       inventoryentries,
//       ledgerentries
//     }
//     await connection.commit()
//   }
//   catch (e) {
//     await connection.rollback()
//     throw e
//   }
//   finally {
//     connection.release()
//   }
// }

// BULK INSERTS
// export const insertInvoicesBulk = (conn, rows) => {
//   return conn.query(
//     `INSERT INTO invoices
//     (uuid, guid, voucher_number, voucher_type, invoice_date, effective_date,
//      party_name, party_ledger_name, party_gstin, company_gstin,
//      place_of_supply, state_name, narration,sub_total, total_amount, created_by)
//     VALUES ?
//     ON DUPLICATE KEY UPDATE guid = guid`,
//     [rows]
//   );
// };


// GET (UNCHANGED)
// export const getSalesModelData = async () => {
//   const conn = await db.getConnection();

//   try {
//     const [rows] = await conn.query(`
//       SELECT
//         i.uuid AS invoice_id,
//         i.voucher_number,
//         i.invoice_date,
//         i.party_name,
//         i.total_amount,

//         p.party_type, p.name AS party_name_detail,
//         a.address_type, a.address_line,

//         itm.stock_item_name, itm.quantity, itm.rate, itm.amount,

//         le.ledger_name, le.amount AS ledger_amount, le.entry_type

//       FROM invoices i
//       LEFT JOIN invoice_parties p ON i.uuid = p.invoice_uuid
//       LEFT JOIN invoice_addresses a ON i.uuid = a.invoice_uuid
//       LEFT JOIN invoice_items itm ON i.uuid = itm.invoice_uuid
//       LEFT JOIN ledger_entries le ON i.uuid = le.invoice_uuid
//       ORDER BY i.invoice_date DESC
//     `);

//     const map = new Map();

//     for (const r of rows) {
//       if (!map.has(r.invoice_id)) {
//         map.set(r.invoice_id, {
//           invoice_id: r.invoice_id,
//           voucher_number: r.voucher_number,
//           invoice_date: r.invoice_date,
//           party_name: r.party_name,
//           total_amount: r.total_amount,
//           parties: [],
//           addresses: [],
//           items: [],
//           ledgers: []
//         });
//       }

//       const inv = map.get(r.invoice_id);

//       if (r.party_type)
//         inv.parties.push({ type: r.party_type, name: r.party_name_detail });

//       if (r.address_line)
//         inv.addresses.push({ type: r.address_type, line: r.address_line });

//       if (r.stock_item_name)
//         inv.items.push({
//           name: r.stock_item_name,
//           qty: r.quantity,
//           rate: r.rate,
//           amount: r.amount
//         });

//       if (r.ledger_name)
//         inv.ledgers.push({
//           name: r.ledger_name,
//           amount: r.ledger_amount,
//           type: r.entry_type
//         });
//     }

//     return Array.from(map.values());

//   } finally {
//     conn.release();
//   }
// };

//  purchase serivice.js
// HELPERS

// const parseQty = (str) => {
//   if (!str) return { qty: 0, unit: null };
//   const [q, u] = str.trim().split(/\s+/);
//   return { qty: parseFloat(q) || 0, unit: u || null };
// };

// const parseRate = (str) => {
//   if (!str) return 0;
//   return parseFloat(str.split('/')[0]) || 0;
// };

// const formatDate = (d) =>
//   `${d.substring(0, 4)}-${d.substring(4, 6)}-${d.substring(6, 8)}`;

// // ADDRESS HELPER (FIXED)
// const processAddress = (arr, type, invoiceUUID, addressRows) => {
//   if (!arr || !Array.isArray(arr)) return;
//   let lineNumber = 1;
//   for (let i = 1; i < arr.length; i++) {
//     const line = arr[i];
//     if (!line || typeof line !== 'string') continue;
//     addressRows.push([
//       invoiceUUID,
//       type,
//       lineNumber++,
//       line.trim()
//     ]);
//   }
// };

// const chunkArray = (arr, size = 500) => {
//   const chunks = [];
//   for (let i = 0; i < arr.length; i += size) {
//     chunks.push(arr.slice(i, i + size));
//   }
//   return chunks;
// };
// const deleteAllTables = async (conn, uuids) => {
//   if (!uuids || uuids.length === 0) return;
//   const chunks = chunkArray(uuids, 500);
//   for (const chunk of chunks) {

//     // ========================
//     // STEP 1: DELETE DEEPEST CHILD (if NOT using FK cascade)
//     // ========================
//     await conn.query(`
//       DELETE FROM batch_allocations 
//       WHERE item_uuid IN (
//         SELECT uuid FROM invoice_items WHERE invoice_uuid IN (?)
//       )
//     `, [chunk]);

//     // ========================
//     // STEP 2: DELETE ITEMS
//     // ========================
//     await conn.query(
//       `DELETE FROM invoice_items WHERE invoice_uuid IN (?)`,
//       [chunk]
//     );

//     // ========================
//     // STEP 3: LEDGER + ACCOUNTING DIMENSIONS
//     // ========================
//     await conn.query(
//       `DELETE FROM ledger_entries WHERE invoice_uuid IN (?)`,
//       [chunk]
//     );

//     await conn.query(
//       `DELETE FROM cost_centre_allocations WHERE invoice_uuid IN (?)`,
//       [chunk]
//     );

//     await conn.query(
//       `DELETE FROM bill_allocations WHERE invoice_uuid IN (?)`,
//       [chunk]
//     );

//     // ========================
//     // STEP 4: PARTY + ADDRESS + GST
//     // ========================
//     await conn.query(
//       `DELETE FROM invoice_parties WHERE invoice_uuid IN (?)`,
//       [chunk]
//     );

//     await conn.query(
//       `DELETE FROM invoice_addresses WHERE invoice_uuid IN (?)`,
//       [chunk]
//     );

//     await conn.query(
//       `DELETE FROM invoice_gst_details WHERE invoice_uuid IN (?)`,
//       [chunk]
//     );
//   }
// };


// CREATE BULK SALES


// delete all tabels
// const deleteAllTables = async (conn, uuids) => {
//   if (!uuids.length) return;

//   const chunks = chunkArray(uuids, 500);

//   for (const chunk of chunks) {

//     // 🔥 DELETE IN STRICT ORDER

//     // Batch allocations
//     await conn.query(`
//       DELETE ba FROM batch_allocations ba
//       JOIN invoice_items ii ON ba.item_uuid = ii.uuid
//       WHERE ii.invoice_uuid IN (?)
//     `, [chunk]);

//     // Items
//     await conn.query(
//       `DELETE FROM invoice_items WHERE invoice_uuid IN (?)`,
//       [chunk]
//     );

//     // Ledger dependent
//     await conn.query(
//       `DELETE FROM cost_centre_allocations WHERE invoice_uuid IN (?)`,
//       [chunk]
//     );

//     await conn.query(
//       `DELETE FROM bill_allocations WHERE invoice_uuid IN (?)`,
//       [chunk]
//     );

//     await conn.query(
//       `DELETE FROM ledger_entries WHERE invoice_uuid IN (?)`,
//       [chunk]
//     );

//     // Party & address
//     await conn.query(
//       `DELETE FROM invoice_parties WHERE invoice_uuid IN (?)`,
//       [chunk]
//     );

//     await conn.query(
//       `DELETE FROM invoice_addresses WHERE invoice_uuid IN (?)`,
//       [chunk]
//     );

//     await conn.query(
//       `DELETE FROM invoice_gst_details WHERE invoice_uuid IN (?)`,
//       [chunk]
//     );
//   }
// };

// function normalizeVoucher(v) {
//   if (v.allinventoryentries && v.ledgerentries) {
//     return v;
//   }

//   const nv = { ...v };
//   if (v.allledgerentries) {
//     nv.ledgerentries = v.allledgerentries.map(l => {
//       const copy = { ...l };
//       if (l.inventoryallocations) {
//         nv.allinventoryentries = nv.allinventoryentries || [];
//         for (const inv of l.inventoryallocations) {
//           nv.allinventoryentries.push({
//             ...inv,
//             accountingallocations: [
//               {
//                 ledgername: l.ledgername,
//                 amount: inv.amount
//               }
//             ]
//           });
//         }
//       }
//       return copy;
//     });
//   }
//   nv.allinventoryentries = nv.allinventoryentries || [];
//   nv.ledgerentries = nv.ledgerentries || [];
//   return nv;
// }
//  const salesFlatsql = `SELECT 
//         i.uuid AS invoice_id,
//         i.voucher_number,
//         i.voucher_type,
//         i.invoice_date,
//         i.effective_date,
//         i.party_name,
//         i.party_ledger_name,
//         i.party_gstin,
//         i.company_gstin,
//         i.place_of_supply,
//         i.state_name,
//         i.cmpgststate,
//         i.narration,
//         i.sub_total,
//         i.total_amount,
//         buyer.name AS buyer_name,
//         buyer.mailing_name AS buyer_mailing_name,
//         buyer.gstin AS buyer_gstin,
//         buyer.state AS buyer_state,
//         buyer.country AS buyer_country,
//         consignee.name AS consignee_name,
//         consignee.mailing_name AS consignee_mailing_name,
//         consignee.gstin AS consignee_gstin,
//         consignee.state AS consignee_state,
//         consignee.country AS consignee_country,
//         addr_buyer.address_line AS buyer_address,
//         addr_consignee.address_line AS consignee_address,
//         itm.uuid AS item_id,
//         itm.stock_item_name,
//         itm.hsn_code,
//         itm.quantity,
//         itm.unit,
//         itm.rate,
//         itm.discount,
//         itm.amount,
//         itm.billedqty,
//         itm.mrp_rate,
//         itm.inclvatrate,
//         le.ledger_name,
//         le.amount AS ledger_amount,
//         le.entry_type,
//         gst.registration_name,
//         gst.tax_type,
//         gst.gstin AS gst_number,
//         gst.state AS gst_state   FROM sales i   LEFT JOIN sales_items itm    ON i.id = itm.sales_id  LEFT JOIN sales_parties buyer  ON i.id = buyer.sales_id AND buyer.party_type = 'BUYER'
//         LEFT JOIN invoice_parties consignee   ON i.uuid = consignee.invoice_uuid  AND consignee.party_type = 'CONSIGNEE'
//         LEFT JOIN invoice_addresses addr_buyer ON i.uuid = addr_buyer.invoice_uuid  AND addr_buyer.address_type = 'BUYER'
//         LEFT JOIN invoice_addresses addr_consignee ON i.uuid = addr_consignee.invoice_uuid   AND addr_consignee.address_type = 'CONSIGNEE'
//         LEFT JOIN ledger_entries le   ON i.uuid = le.invoice_uuid LEFT JOIN invoice_gst_details gst  ON i.uuid = gst.invoice_uuid ORDER BY i.invoice_date DESC`

// import { z } from 'zod';
// import { AppError } from '../../shared/app-error.js';
// import { createSale, getSalesByCompany } from './sales.service.js';

// const createSalesSchema = z.object({
//   title: z.string().trim().min(2).max(160),
//   amount: z.coerce.number().positive(),
//   distributor_company_id: z.coerce.number().int().positive().nullable().optional(),
//   zone: z.string().trim().min(2).max(100),
//   state: z.string().trim().min(2).max(100),
//   status: z.enum(['pending', 'paid', 'cancelled']).optional()
// });
// we have to do init after cloning data folder 
// const salesFilterSchema = z.object({
//   distributor_company_id: z.coerce.number().int().positive().optional(),
//   zone: z.string().trim().min(2).max(100).optional(),
//   state: z.string().trim().min(2).max(100).optional(),
//   salesman_id: z.coerce.number().int().positive().optional()
// });

// function parseSchema(schema, payload) {
//   const result = schema.safeParse(payload);

//   if (!result.success) {
//     const message = result.error.issues[0]?.message || 'Validation failed';
//     throw new AppError(message, 400);
//   }

//   return result.data;
// }

// export async function getSales(request, response) {
//   const filters = parseSchema(salesFilterSchema, request.query);
//   const sales = await getSalesByCompany(request.user.company_id, {
//     distributorCompanyId: filters.distributor_company_id,
//     zone: filters.zone,
//     state: filters.state,
//     salesmanId: filters.salesman_id
//   });

//   return response.status(200).json({
//     success: true,
//     data: sales
//   });
// }

// export async function createSalesRecord(request, response) {
//   const payload = parseSchema(createSalesSchema, request.body);

//   const sale = await createSale({
//     companyId: request.user.company_id,
//     userId: request.user.id,
//     distributorCompanyId: payload.distributor_company_id ?? null,
//     title: payload.title,
//     amount: payload.amount,
//     zone: payload.zone,
//     state: payload.state,
//     status: payload.status || 'pending'
//   });

//   return response.status(201).json({
//     success: true,
//     message: 'Sale created successfully',
//     data: sale
//   });
// }

// import { createSalesVoucher } from './sales.service.js';

// export const createSales = async (req, res) => {
//   try {
//     if (!req.body || !req.body.guid) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid payload'
//       });
//     }

//     const result = await createSalesVoucher(req.body);

//     return res.status(200).json({
//       success: true,
//       data: result
//     });

//   } catch (err) {
//     console.error('Sales Error:', err);

//     return res.status(500).json({
//       success: false,
//       message: 'Internal Server Error',
//       error: err.message
//     });
//   }
// };

// import { createBulkSales } from './sales.service.js';

// export const createSalesBulk = async (req, res) => {
//   try {
//     if (!req.body?.tallymessage) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid Tally payload'
//       });
//     }

//     const result = await createBulkSales(req.body);

//     return res.status(200).json({
//       success: true,
//       data: result
//     });

//   } catch (err) {
//     console.error('Bulk Insert Error:', err);

//     return res.status(500).json({
//       success: false,
//       message: 'Bulk insert failed',
//       error: err.message
//     });
//   }
// };

//***************************************************parser.js*************************************
// // parsers/stock.parser.js
// export const parseStockItems = (data) => {
//   const items = [];

//   for (const item of data["Stock items"] || []) {
//     const qty = parseFloat(item.openingbalance?.split(' ')[0]) || 0;
//     const rate = parseFloat(item.openingrate?.split('/')[0]) || 0;

//     const parsed = {
//       guid: item.guid,
//       name: item.metadata?.name,
//       parent: item.parent,
//       category: item.category,
//       base_unit: item.baseunits,
//       opening_qty: qty,
//       opening_rate: rate,
//       opening_value: item.openingvalue || 0,
//       is_batchwise: item.isbatchwiseon || false,

//       tax: extractTax(item),
//       batches: extractBatches(item),
//       prices: extractPrices(item),

//       // ✅ IMPORTANT (ADDED)
//       gstList: extractGST(item),
//       hsnList: extractHSN(item)
//     };

//     items.push(parsed);
//   }

//   return items;
// };

// function extractTax(item) {
//   const rates = item.gstdetails?.[0]?.statewisedetails?.[0]?.ratedetails || [];

//   let cgst = 0, sgst = 0, igst = 0;

//   for (const r of rates) {
//     if (r.gstratedutyhead === 'CGST') cgst = parseFloat(r.gstrate || 0);
//     if (r.gstratedutyhead.includes('SGST')) sgst = parseFloat(r.gstrate || 0);
//     if (r.gstratedutyhead === 'IGST') igst = parseFloat(r.gstrate || 0);
//   }

//   return {
//     cgst,
//     sgst,
//     igst,
//     hsn_code: item.hsndetails?.[0]?.hsncode || null
//   };
// }

// function extractBatches(item) {
//   return (item.batchallocations || []).map(b => ({
//     godown: b.godownname,
//     batch_name: b.batchname,
//     qty: parseFloat(b.openingbalance),
//     rate: parseFloat(b.openingrate)
//   }));
// }

// function extractPrices(item) {
//   const prices = [];

//   for (const p of item.fullpricelist || []) {
//     for (const d of p.pricelevellist || []) {
//       prices.push({
//         price_type: p.pricelevel,
//         min_qty: parseFloat(d.startingfrom || 0),
//         max_qty: parseFloat(d.endingat || 0),
//         rate: parseFloat(d.rate),
//         discount: parseFloat(d.discount || 0)
//       });
//     }
//   }

//   return prices;
// }

// function extractGST(item) {
//   const gstList = [];

//   for (const g of item.gstdetails || []) {
//     const gst = {
//       applicable_from: formatDate(g.applicablefrom),
//       taxability: g.taxability,
//       source: g.srcofgstdetails,
//       is_reverse_charge: g.isreversechargeapplicable || false,
//       is_non_gst: g.isnongstgoods || false,
//       is_ineligible_itc: g.gstineligibleitc || false,
//       rates: []
//     };

//     for (const state of g.statewisedetails || []) {
//       let cgst = 0, sgst = 0, igst = 0, cess = 0;

//       for (const r of state.ratedetails || []) {
//         const rate = parseFloat(r.gstrate || 0);

//         if (r.gstratedutyhead === 'CGST') cgst = rate;
//         if (r.gstratedutyhead.includes('SGST')) sgst = rate;
//         if (r.gstratedutyhead === 'IGST') igst = rate;
//         if (r.gstratedutyhead === 'Cess') cess = rate;
//       }

//       gst.rates.push({
//         state_name:cleanString(state.statename),
//         cgst,
//         sgst,
//         igst,
//         cess
//       });
//     }

//     gstList.push(gst);
//   }

//   return gstList;
// }

// function extractHSN(item) {
//   const hsnList = [];

//   for (const h of item.hsndetails || []) {
//     hsnList.push({
//       applicable_from: formatDate(h.applicablefrom),
//       hsn_code: h.hsncode,
//       source: h.srcofhsndetails
//     });
//   }

//   return hsnList;
// }

// function formatDate(dateStr) {
//   if (!dateStr) return null;
//   return `${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}`;
// }

// function cleanString(val) {
//   if (!val) return null;
//   return val.replace(/\u0004/g, '').trim();
// }

// function cleanNumber(val) {
//   if (!val) return 0;
//   return parseFloat(val.toString().replace(/[^\d.-]/g, '')) || 0;
// }

//stockitem serveice ********************************************
// services/stock.service.js

// export const processStockBulk = async (items) => {
//   const conn = await db.getConnection();

//   try {
//     await conn.beginTransaction();

//     const batches = chunkArray(items, 1000);

//     let total = 0;

//     for (const batch of batches) {

//       // ========================
//       // 1. UPSERT MASTER
//       // ========================
//       await bulkUpsertStock(conn, batch);

//       const idMap = await getStockIdMap(conn, batch);
//       const stockIds = [...idMap.values()];

//       // ========================
//       // 2. CLEAN CHILD DATA (SAFE SCOPED)
//       // ========================
//       await deleteChildData(conn, stockIds);

//       // ========================
//       // 3. INSERT CHILD DATA
//       // ========================
//       await upsertChildTables(conn, idMap, batch);

//       await refreshGST(conn, idMap, batch);
//       await refreshHSN(conn, idMap, batch);

//       total += batch.length;
//     }

//     await conn.commit();

//     return { success: true, total };

//   } catch (err) {
//     await conn.rollback();
//     throw err;
//   } finally {
//     conn.release();
//   }
// };


//stockmodel*******************************************************
// repositories/stock.repo.js
// export const bulkUpsertStock = async (conn, items) => {
//   const values = items.map(i => [
//     i.guid, i.name, i.parent, i.category,
//     i.base_unit, i.opening_qty,
//     i.opening_rate, i.opening_value,
//     i.is_batchwise
//   ]);

//   const query = `
//     INSERT INTO stock_master
//     (guid, name, parent, category, base_unit,
//      opening_qty, opening_rate, opening_value, is_batchwise)
//     VALUES ?
//     ON DUPLICATE KEY UPDATE
//       name=VALUES(name),
//       parent=VALUES(parent),
//       category=VALUES(category),
//       base_unit=VALUES(base_unit),
//       opening_qty=VALUES(opening_qty),
//       opening_rate=VALUES(opening_rate),
//       opening_value=VALUES(opening_value),
//       is_batchwise=VALUES(is_batchwise)
//   `;

//   await conn.query(query, [values]);
// };
// export const bulkUpsertStock = async (conn, items) => {
//   if (!items.length) return;

//   const values = items.map(i => [
//     i.guid,
//     i.name,
//     i.parent,
//     i.category,
//     i.base_unit,
//     i.opening_qty,
//     i.opening_rate,
//     i.opening_value,
//     i.is_batchwise
//   ]);

//   await conn.query(`
//     INSERT INTO stock_master
//     (guid, name, parent, category, base_unit,
//      opening_qty, opening_rate, opening_value, is_batchwise)
//     VALUES ?
//     ON DUPLICATE KEY UPDATE
//       name = VALUES(name),
//       parent = VALUES(parent),
//       category = VALUES(category),
//       base_unit = VALUES(base_unit),
//       opening_qty = VALUES(opening_qty),
//       opening_rate = VALUES(opening_rate),
//       opening_value = VALUES(opening_value),
//       is_batchwise = VALUES(is_batchwise)
//   `, [values]);
// };
// export const bulkUpsertStockItemsMaster = async (conn, items) => {
//   if (!items.length) return;

//   const values = items.map(i => {
//     const name = normalizeName(i.name);

//     return [
//       i.guid,
//       name,
//       i.parent || null,
//       i.category || null,
//       i.base_unit || null,
//       i.opening_qty || 0,
//       i.opening_rate || 0,
//       i.opening_value || 0,
//       i.is_batchwise || false
//     ];
//   });

//   // 🔥 STEP 1: INSERT OR UPDATE BY GUID
//   await conn.query(`
//     INSERT INTO stock_items
//     (guid, name, parent, category, base_unit,
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
//       is_synced = TRUE,
//       is_from_invoice = FALSE
//   `, [values]);

//   // 🔥 STEP 2: ATTACH GUID TO INVOICE-CREATED ITEMS
//   for (const i of items) {
//     const name = normalizeName(i.name);

//     await conn.query(`
//       UPDATE stock_items
//       SET guid = ?, is_synced = TRUE, is_from_invoice = FALSE
//       WHERE name = ?
//         AND guid IS NULL
//     `, [i.guid, name]);
//   }
// };


// export const getStockIdMap = async (conn, items) => {
//   const [rows] = await conn.query(
//     `SELECT id, guid FROM stock_master WHERE guid IN (?)`,
//     [items.map(i => i.guid)]
//   );

//   return new Map(rows.map(r => [r.guid, r.id]));
// };

// export const getStockIdMap = async (conn, items) => {
//   if (!items.length) return new Map();
//   const [rows] = await conn.query(
//     `SELECT id, guid FROM stock_master WHERE guid IN (?)`,
//     [items.map(i => i.guid)]
//   );
//   //  console.log("Rows",rows)
//   return new Map(rows.map(r => [r.guid, r.id]));
// };

// export const refreshGST = async (conn, idMap, items) => {
//   const stockIds = [...idMap.values()];

//   const gstRows = [];
//   const rateRows = [];

//   for (const item of items) {
//     const stockId = idMap.get(item.guid);
//     if (!stockId) continue;

//     for (const g of item.gstList || []) {
//       gstRows.push([
//         stockId,
//         g.applicable_from,
//         g.taxability,
//         g.source,
//         g.is_reverse_charge,
//         g.is_non_gst,
//         g.is_ineligible_itc
//       ]);
//     }
//   }

//   if (gstRows.length) {
//     await conn.query(`
//       INSERT INTO stock_item_gst
//       (stock_item_id, applicable_from, taxability, source,
//        is_reverse_charge, is_non_gst, is_ineligible_itc)
//       VALUES ?
//       ON DUPLICATE KEY UPDATE
//         taxability=VALUES(taxability),
//         source=VALUES(source),
//         is_reverse_charge=VALUES(is_reverse_charge),
//         is_non_gst=VALUES(is_non_gst),
//         is_ineligible_itc=VALUES(is_ineligible_itc)
//     `, [gstRows]);
//   }

//   // ✅ SAFE FETCH
//   const [gstRecords] = await conn.query(`
//     SELECT id, stock_item_id, applicable_from
//     FROM stock_item_gst
//     WHERE stock_item_id IN (?)
//   `, [stockIds]);

//   function normalizeDate(d) {
//     if (!d) return null;
//     return new Date(d).toISOString().slice(0, 10);
//   }

//   const gstMap = new Map();

// function formatDBDate(date) {
//   if (!date) return null;

//   // Handles both Date object and string
//   if (typeof date === "string") return date.slice(0, 10);

//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const day = String(date.getDate()).padStart(2, '0');

//   return `${year}-${month}-${day}`;
// }

// for (const g of gstRecords) {
//   const dbDate = formatDBDate(g.applicable_from);
//   const key = `${g.stock_item_id}_${dbDate}`;
//   console.log("dbkey",key)
//   gstMap.set(key, g.id);
// }
//   for (const item of items) {
//     const stockId = idMap.get(item.guid);
//     for (const g of item.gstList || []) {
//      const key = `${stockId}_${formatDBDate(g.applicable_from)}`;
//       console.log("gkey",key)
//       const gstId = gstMap.get(key);      
//       if (!gstId) continue; // 🚨 FIX
//       for (const r of g.rates || []) {
//         rateRows.push([
//           gstId,
//           r.state_name,
//           r.cgst,
//           r.sgst,
//           r.igst,
//           r.cess
//         ]);
//       }
//     }
//   }
//     console.log(rateRows)
//   if (rateRows.length) {
//     await conn.query(`
//       INSERT INTO stock_item_gst_rates
//       (gst_id, state_name, cgst, sgst, igst, cess)
//       VALUES ?
//       ON DUPLICATE KEY UPDATE
//         cgst=VALUES(cgst),
//         sgst=VALUES(sgst),
//         igst=VALUES(igst),
//         cess=VALUES(cess)
//     `, [rateRows]);
//   }
// };
// export const refreshGST = async (conn, idMap, items) => {
//   const gstRows = [];

//   for (const item of items) {
//     const stockId = idMap.get(item.guid);
//     if (!stockId) continue;

//     for (const g of item.gstList || []) {
//       gstRows.push([
//         stockId,
//         formatDBDate(g.applicable_from),
//         g.taxability,
//         g.source,
//         g.is_reverse_charge,
//         g.is_non_gst,
//         g.is_ineligible_itc
//       ]);
//     }
//   }

//   if (gstRows.length) {
//     await conn.query(`
//       INSERT INTO stock_item_gst
//       (stock_item_id, applicable_from, taxability, source,
//        is_reverse_charge, is_non_gst, is_ineligible_itc)
//       VALUES ?
//       ON DUPLICATE KEY UPDATE
//         taxability = VALUES(taxability),
//         source = VALUES(source),
//         is_reverse_charge = VALUES(is_reverse_charge),
//         is_non_gst = VALUES(is_non_gst),
//         is_ineligible_itc = VALUES(is_ineligible_itc)
//     `, [gstRows]);
//   }

//   const [gstRecords] = await conn.query(
//     `SELECT id, stock_item_id, applicable_from 
//      FROM stock_item_gst 
//      WHERE stock_item_id IN (?)`,
//     [[...idMap.values()]]
//   );

//   const gstMap = new Map();

//   for (const g of gstRecords) {
//     gstMap.set(
//       `${g.stock_item_id}_${formatDBDate(g.applicable_from)}`,
//       g.id
//     );
//   }

//   const rateRows = [];

//   for (const item of items) {
//     const stockId = idMap.get(item.guid);

//     for (const g of item.gstList || []) {
//       const gstId = gstMap.get(
//         `${stockId}_${formatDBDate(g.applicable_from)}`
//       );

//       if (!gstId) continue;

//       for (const r of g.rates || []) {
//         rateRows.push([
//           gstId,
//           r.state_name,
//           r.cgst,
//           r.sgst,
//           r.igst,
//           r.cess
//         ]);
//       }
//     }
//   }

//   if (rateRows.length) {
//     await conn.query(`
//       INSERT INTO stock_item_gst_rates
//       (gst_id, state_name, cgst, sgst, igst, cess)
//       VALUES ?
//       ON DUPLICATE KEY UPDATE
//         cgst = VALUES(cgst),
//         sgst = VALUES(sgst),
//         igst = VALUES(igst),
//         cess = VALUES(cess)
//     `, [rateRows]);
//   }
// };

// export const refreshHSN = async (conn, idMap, items) => {
//   const hsnRows = [];

//   for (const item of items) {
//     const stockId = idMap.get(item.guid);
//     if (!stockId) continue;

//     for (const h of item.hsnList || []) {
//       hsnRows.push([
//         stockId,
//         h.applicable_from,
//         h.hsn_code,
//         h.source
//       ]);
//     }
//   }

//   if (hsnRows.length) {
//     await conn.query(`
//       INSERT INTO stock_item_hsn
//       (stock_item_id, applicable_from, hsn_code, source)
//       VALUES ?
//       ON DUPLICATE KEY UPDATE
//         hsn_code=VALUES(hsn_code),
//         source=VALUES(source)
//     `, [hsnRows]);
//   }
// };


// export const deleteChildData = async (conn, stockIds) => {
//   if (!stockIds.length) return;
//   await conn.query(`DELETE FROM stock_item_tax WHERE stock_item_id IN (?)`, [stockIds]);
//   await conn.query(`DELETE FROM stock_batches WHERE stock_item_id IN (?)`, [stockIds]);
//   await conn.query(`DELETE FROM stock_prices WHERE stock_item_id IN (?)`, [stockIds]);
//   await conn.query(`DELETE FROM stock_item_gst WHERE stock_item_id IN (?)`, [stockIds]);
//   await conn.query(`DELETE FROM stock_item_gst_rates WHERE gst_id NOT IN (
//     SELECT id FROM stock_item_gst
//   )`);
//   await conn.query(`DELETE FROM stock_item_hsn WHERE stock_item_id IN (?)`, [stockIds]);
// };

// export const deleteChildData = async (conn, stockIds) => {
//   if (!stockIds.length) return;

//   await conn.query(
//     `DELETE FROM stock_item_tax WHERE stock_item_id IN (?)`,
//     [stockIds]
//   );

//   await conn.query(
//     `DELETE FROM stock_batches WHERE stock_item_id IN (?)`,
//     [stockIds]
//   );

//   await conn.query(
//     `DELETE FROM stock_prices WHERE stock_item_id IN (?)`,
//     [stockIds]
//   );

//   await conn.query(
//     `DELETE FROM stock_item_gst_rates 
//      WHERE gst_id IN (
//         SELECT id FROM stock_item_gst WHERE stock_item_id IN (?)
//      )`,
//     [stockIds]
//   );

//   await conn.query(
//     `DELETE FROM stock_item_gst WHERE stock_item_id IN (?)`,
//     [stockIds]
//   );

//   await conn.query(
//     `DELETE FROM stock_item_hsn WHERE stock_item_id IN (?)`,
//     [stockIds]
//   );
// };
// const [[stockprice]] = await db.execute(`SELECT stock_item_name, FORMAT(SUM(rate) / SUM(quantity),2) AS avg_rate FROM invoice_items GROUP BY stock_item_name`)

// const getFullPOView = async (voucherId) => {
//   const conn = await db.getConnection();
//   try {
//     //  PARALLEL QUERIES
//     const [
//       [voucherRows],
//       [partyRows],
//       [addressRows],
//       [itemRows],
//       [ledgerRows],
//       [gstRows]
//     ] = await Promise.all([
//       conn.query(`SELECT * FROM vouchers WHERE uuid = ?`, [voucherId]),
//       conn.query(`SELECT * FROM voucher_parties WHERE voucher_uuid = ?`, [voucherId]),
//       conn.query(`SELECT * FROM voucher_addresses WHERE voucher_uuid = ? ORDER BY line_number`, [voucherId]),
//       conn.query(`SELECT * FROM purchase_items WHERE voucher_uuid = ?`, [voucherId]),
//       conn.query(`SELECT * FROM voucher_ledger_entries WHERE voucher_uuid = ? and is_party_ledger = false `, [voucherId]),
//       conn.query(`SELECT * FROM voucher_gst_details WHERE voucher_uuid = ?`, [voucherId])
//     ]);
//     const voucher = voucherRows[0];
//     if (!voucher) return null;
//     //  PARTY MAPPING
//     let buyer = null;
//     let consignee = null;
//     for (const p of partyRows) {
//       if (p.party_type === 'BUYER') {
//         buyer = {
//           name: p.name,
//           mailing_name: p.mailing_name,
//           gstin: p.gstin,
//           gst_registration_type: p.gst_registration_type,
//           state: p.state,
//           country: p.country,
//           address: []
//         };
//       }
//       if (p.party_type === 'CONSIGNEE') {
//         consignee = {
//           name: p.name,
//           mailing_name: p.mailing_name,
//           gstin: p.gstin,
//           gst_registration_type: p.gst_registration_type,
//           state: p.state,
//           country: p.country,
//           address: []
//         };
//       }
//     }

//     // ADDRESS MAPPING
//     for (const a of addressRows) {
//       if (a.address_type === 'BUYER' && buyer) {
//         buyer.address.push(a.address_line);
//       }
//       if (a.address_type === 'CONSIGNEE' && consignee) {
//         consignee.address.push(a.address_line);
//       }
//     }
//     // ITEMS
//     const items = itemRows.map(i => ({
//       name: i.stock_item_name,
//       hsn_code: i.hsn_code,
//       quantity: i.quantity,
//       unit: i.unit,
//       rate: i.rate,
//       amount: i.amount,
//       billedqty: i.billedqty
//     }));
//     //  LEDGERS
//     const ledgers = ledgerRows.map(l => ({
//       name: l.ledger_name,
//       amount: l.amount,
//       type: l.entry_type,
//       is_party_ledger: l.is_party_ledger
//     }));
//     //  GST
//     const gst = gstRows.map(g => ({
//       registration_name: g.registration_name,
//       tax_type: g.tax_type,
//       gstin: g.gstin,
//       state: g.state
//     }));
//     //  FINAL RESPONSE
//     return {
//       voucher: {
//         voucher_id: voucher.uuid,
//         voucher_number: voucher.voucher_number,
//         voucher_date: voucher.voucher_date,
//         effective_date: voucher.effective_date,
//         party_name: voucher.party_name,
//         party_ledger_name: voucher.party_ledger_name,
//         party_gstin: voucher.party_gstin,
//         company_gstin: voucher.company_gstin,
//         place_of_supply: voucher.place_of_supply,
//         state_name: voucher.state_name,
//         narration: voucher.narration,
//         total_amount: voucher.total_amount
//       },
//       buyer,
//       consignee,
//       items,
//       ledgers,
//       gst
//     };
//   } finally {
//     conn.release();
//   }
// };


// import jwt from 'jsonwebtoken';

// import extractAccessToken from '../utils/token-extractor.util.js';
// import { verifyAccessToken } from '../utils/jwt.util.js';

// const authenticate = (req, res, next) => {
//   try {

//     const token = extractAccessToken(req);

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: 'Access token missing',
//         code: 'AUTH_TOKEN_MISSING',
//       });
//     }

//     const decoded = verifyAccessToken(token);
  
//     console.log(decoded)
//     const requiredClaims = [

//       'userId',
//       'manufacturerId',
//       'distributorId',
//       'userType',
//     ];

//     const missingClaims = requiredClaims.filter(
//       (claim) => decoded?.[claim] === undefined
//     );
//     if (missingClaims.length > 0) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid token payload',
//         code: 'AUTH_TOKEN_PAYLOAD_INVALID',
//       });
//     }


//     req.auth = {
//       sessionId: decoded.sessionId,
//       userId: decoded.userId,
//       manufacturerId: decoded.manufacturerId,
//       distributorId: decoded.distributorId,
//       userType: decoded.userType,
//     };

//     return next();
//   } catch (error) {

//     if (error instanceof jwt.TokenExpiredError) {
//       return res.status(401).json({
//         success: false,
//         message: 'Access token expired',
//         code: 'AUTH_TOKEN_EXPIRED',
//       });
//     }

//     // ---------------------------------------------------
//     // Invalid JWT   like this we need same response for api key so to achieve that one provide best thing 
//     // ---------------------------------------------------

//     if (error instanceof jwt.JsonWebTokenError) {
//       console.log("Entered")
//       console.log(error)
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid access token',
//         code: 'AUTH_TOKEN_INVALID',
//       });
//     }

//     // ---------------------------------------------------
//     // Unexpected Error
//     // ---------------------------------------------------

//     return res.status(500).json({
//       success: false,
//       message: 'Authentication middleware failed',
//       code: 'AUTH_MIDDLEWARE_ERROR',
//     });
//   }
// };

// export default authenticate;
//*****************************Distributor Service***************************************** */
// import bcrypt from "bcrypt";
// import { db } from "../../config/database.js";

// import { DistributorRepository }
//   from "./distributor.repository.js";

// export class DistributorService {
//   constructor() {
//     this.repository = new DistributorRepository(db);
//   }

//   async onboardDistributor(payload, currentUser) {
//     const connection = await db.getConnection();

//     try {
//       await connection.beginTransaction();

//       if (!currentUser) {
//         throw new Error("Unauthorized");
//       }

//       const manufacturerId = currentUser.manufacturerId;

//       if (currentUser.distributorId) {
//         const parentDistributor =
//           await this.repository.findParentDistributor(
//             connection,
//             currentUser.distributorId,
//             manufacturerId
//           );

//         if (!parentDistributor) {
//           throw new Error("Invalid parent distributor");
//         }
//       }

//       const existingRole =
//         await this.repository.checkRoleExists(
//           connection,
//           manufacturerId,
//           payload.role_code
//         );

//       if (existingRole) {
//         throw new Error("Role code already exists");
//       }

//       const existingUser =
//         await this.repository.checkUserEmail(
//           connection,
//           payload.admin_user.email
//         );

//       if (existingUser) {
//         throw new Error("Email already exists");
//       }

//       const permissions =
//         await this.repository.validatePermissions(
//           connection,
//           payload.permission_ids
//         );

//       if (
//         permissions.length !== payload.permission_ids.length
//       ) {
//         throw new Error("Invalid permissions");
//       }

//       const distributorId =
//         await this.repository.createDistributor(
//           connection,
//           payload,
//           manufacturerId
//         );

//       const roleId =
//         await this.repository.createRole(
//           connection,
//           manufacturerId,
//           payload.role_name,
//           payload.role_code
//         );

//       await this.repository.mapRolePermissions(
//         connection,
//         roleId,
//         payload.permission_ids
//       );

//       const hashedPassword = await bcrypt.hash(
//         payload.admin_user.password,
//         10
//       );

//       const userId =
//         await this.repository.createUser(connection, {
//           manufacturer_id: manufacturerId,
//           distributor_id: distributorId,
//           reporting_to_user_id: currentUser.userId,
//           user_type: "DISTRIBUTOR",
//           first_name: payload.admin_user.first_name,
//           last_name: payload.admin_user.last_name,
//           email: payload.admin_user.email,
//           mobile: payload.admin_user.mobile,
//           password_hash: hashedPassword
//         });

//       await this.repository.assignRoleToUser(
//         connection,
//         userId,
//         roleId
//       );

//       const apiKey =
//         await this.repository.createApiKey(
//           connection,
//           manufacturerId,
//           distributorId,
//           userId,
//           payload.role_name
//         );

//       await connection.commit();

//       return {
//         success: true,
//         message: "Distributor onboarded successfully",
//         data: {
//           distributor_id: distributorId,
//           user_id: userId,
//           role_id: roleId,
//           api_key: apiKey
//         }
//       };
//     } catch (error) {
//       await connection.rollback();
//       throw error;
//     } finally {
//       connection.release();
//     }
//   }
// }
// distributor.service.js
// import { DistributorService }
//   from "./distributor.service.js";

// const service = new DistributorService();

// export class DistributorController {
//   async onboard(req, res, next) {
//     try {
//     console.log(req.auth)
//       const result = await service.onboardDistributor(req.body, req.auth);

//       return res.status(201).json(result);
//     } catch (error) {
//       next(error);
//     }
//   }
// }
// distributor.controller.js
// export class DistributorRepository {
//   constructor(db) {
//     this.db = db;
//   }

//   async findParentDistributor(connection, parentDistributorId, manufacturerId) {
//     const [rows] = await connection.query(
//       `
//       SELECT id
//       FROM distributors
//       WHERE id = ?
//       AND manufacturer_id = ?
//       `,
//       [parentDistributorId, manufacturerId]
//     );

//     return rows[0];
//   }

//   async validatePermissions(connection, permissionIds) {
//     if (!permissionIds.length) return [];

//     const [rows] = await connection.query(
//       `
//       SELECT id
//       FROM permissions
//       WHERE id IN (?)
//       `,
//       [permissionIds]
//     );

//     return rows;
//   }

//   async checkRoleExists(connection, manufacturerId, roleCode) {
//     const [rows] = await connection.query(
//       `
//       SELECT id
//       FROM roles
//       WHERE manufacturer_id = ?
//       AND role_code = ?
//       `,
//       [manufacturerId, roleCode]
//     );

//     return rows[0];
//   }

//   async checkUserEmail(connection, email) {
//     const [rows] = await connection.query(
//       `
//       SELECT id
//       FROM users
//       WHERE email = ?
//       `,
//       [email]
//     );

//     return rows[0];
//   }

//   async createDistributor(connection, payload, manufacturerId) {
//     const [result] = await connection.query(
//       `
//       INSERT INTO distributors (
//         manufacturer_id,
//         parent_distributor_id,
//         distributor_level,
//         distributor_code,
//         business_name,
//         owner_name,
//         gst_number,
//         pan_number,
//         email,
//         mobile,
//         address,
//         state_name,
//         city_name,
//         pincode
//       )
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//       `,
//       [
//         manufacturerId,
//         payload.parent_distributor_id,
//         payload.distributor_level,
//         payload.distributor_code,
//         payload.business_name,
//         payload.owner_name,
//         payload.gst_number,
//         payload.pan_number,
//         payload.email,
//         payload.mobile,
//         payload.address,
//         payload.state_name,
//         payload.city_name,
//         payload.pincode
//       ]
//     );

//     return result.insertId;
//   }

//   async createRole(connection, manufacturerId, roleName, roleCode) {
//     const [result] = await connection.query(
//       `
//       INSERT INTO roles (
//         manufacturer_id,
//         role_code,
//         role_name,
//         is_system_role
//       )
//       VALUES (?, ?, ?, 0)
//       `,
//       [manufacturerId, roleCode, roleName]
//     );

//     return result.insertId;
//   }

//   async mapRolePermissions(connection, roleId, permissionIds) {
//     const values = permissionIds.map((permissionId) => [
//       roleId,
//       permissionId
//     ]);

//     await connection.query(
//       `
//       INSERT INTO role_permissions (
//         role_id,
//         permission_id
//       )
//       VALUES ?
//       `,
//       [values]
//     );
//   }

//   async createUser(connection, userData) {
//     const [result] = await connection.query(
//       `
//       INSERT INTO users (
//         manufacturer_id,
//         distributor_id,
//         reporting_to_user_id,
//         user_type,
//         first_name,
//         last_name,
//         email,
//         mobile,
//         password_hash,
//         status
//       )
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
//       `,
//       [
//         userData.manufacturer_id,
//         userData.distributor_id,
//         userData.reporting_to_user_id,
//         userData.user_type,
//         userData.first_name,
//         userData.last_name,
//         userData.email,
//         userData.mobile,
//         userData.password_hash
//       ]
//     );

//     return result.insertId;
//   }

//   async assignRoleToUser(connection, userId, roleId) {
//     await connection.query(
//       `
//       INSERT INTO user_roles (
//         user_id,
//         role_id
//       )
//       VALUES (?, ?)
//       `,
//       [userId, roleId]
//     );
//   }

//   async createApiKey(
//     connection,
//     manufacturerId,
//     distributorId,
//     userId,
//     roleName
//   ) {
//     const rawKey = crypto.randomBytes(32).toString("hex");

//     const keyHash = crypto
//       .createHash("sha256")
//       .update(rawKey)
//       .digest("hex");

//     await connection.query(
//       `
//       INSERT INTO api_keys (
//         manufacturer_id,
//         distributor_id,
//         user_id,
//         key_hash,
//         key_name
//       )
//       VALUES (?, ?, ?, ?, ?)
//       `,
//       [
//         manufacturerId,
//         distributorId,
//         userId,
//         keyHash,
//         `${roleName} API Key`
//       ]
//     );

//     return rawKey;
//   }
// }
// distributor.repository.js
//******************************LATEST OTP************************************** */
// /**
//  * GET OTP
//  */

// static async getOTP(
//   email,
//   connection = db
// ) {

//   const [rows] = await connection.query(
//     `
//     SELECT *
//     FROM email_otps
//     WHERE email = ?
//     AND purpose = ?
//     ORDER BY id DESC
//     LIMIT 1
//     `,
//     [
//       email,
//       'MANUFACTURER_ONBOARD'
//     ]
//   );

//   return rows[0];

// }

// /**
//  * MARK VERIFIED
//  */

// static async markOTPVerified(
//   email,
//   connection = db
// ) {

//   await connection.query(
//     `
//     UPDATE email_otps
//     SET
//       is_verified = 1,
//       verified_at = NOW()
//     WHERE email = ?
//     AND purpose = ?
//     `,
//     [
//       email,
//       'MANUFACTURER_ONBOARD'
//     ]
//   );

// }

// /**
//  * INCREMENT ATTEMPTS
//  */

// static async incrementOTPAttempts(
//   id,
//   connection = db
// ) {

//   await connection.query(
//     `
//     UPDATE email_otps
//     SET attempts = attempts + 1
//     WHERE id = ?
//     `,
//     [id]
//   );

// }

// /**
//  * DELETE OTP
//  */

// static async deleteOTP(
//   email,
//   connection = db
// ) {

//     DELETE FROM email_otps
//     WHERE email = ?
//     AND purpose = ?
//     `,
//     [
//       email,
//       'MANUFACTURER_ONBOARD'
//     ]
//   );

// }
/**
 * GET LATEST OTP
 */


//****************************MANUFACTURER ROUTER************************************* */
// import express from 'express';
// import { ManufacturerController } from './manufacturer.controller.js';
// import authenticate from '../../shared/middelware/authenticate.middleware.js';

// const router = express.Router();

// router.post(
//   '/onboard',
//   ManufacturerController.onboard
// );
// router.get('/distributors',authenticate, ManufacturerController.getDistributor)
// export default router;
// import express from 'express';

// import { ManufacturerController } from './manufacturer.controller.js';

// import authenticate from '../../shared/middelware/authenticate.middleware.js';

// const router = express.Router();

// /**
//  * SEND OTP
//  */

// router.post('/send-otp',ManufacturerController.sendOTP);

// /**
//  * VERIFY OTP
//  */

// router.post('/verify-otp',ManufacturerController.verifyOTP);

// /**
//  * ONBOARD
//  */

// router.post('/onboard', ManufacturerController.onboard);

// router.get('/distributors',authenticate,ManufacturerController.getDistributor);

// export default router;
 

//**************MANUFACTURER CONTROLLER****************************************** */
// import { ManufacturerService } from './manufacturer.service.js';

// export class ManufacturerController {
//   static async onboard(req, res, next) {
//     try {
//       const response =
//         await ManufacturerService.onboardManufacturer(req.body);

//       return res.status(201).json({
//         success: true,
//         message: "Manufacturer registered successfully",
//         data: response,
//       });

//     } catch (error) {
//       console.log(error)
//       // Example custom handling
//       return res.status(error.statusCode || 500).json({
//         success: false,
//         message:
//           error.message || "Unable to complete sign up. Please try again.",
//       });

//       // OR use next(error) if centralized middleware handles formatting
//     }
//   }
//   static async getDistributor(req, res, next) {
//     try {
//       const response =
//         await ManufacturerService.getDistributor(req.auth);
//       console.log(response)
//       return res.status(201).json(response);
//     }
//     catch (e) {
//       console.log(error)
//       // Example custom handling
//       return res.status(error.statusCode || 500).json({
//         success: false,
//         message:
//           error.message || "Unable to get Distributor.",
//       });
//     }
//   }
// }
// import { ManufacturerService }
// from './manufacturer.service.js';

// export class ManufacturerController {

//   /**
//    * SEND OTP
//    */

//   static async sendOTP(req, res) {

//     try {

//       const response =await ManufacturerService.sendManufacturerOTP(req.body);
//       return res.status(200).json(response);

//     } catch (error) {

//       return res.status(
//         error.statusCode || 500
//       ).json({
//         success: false,
//         message:
//           error.message ||
//           "Unable to send OTP"
//       });

//     }

//   }

//   /**
//    * VERIFY OTP
//    */

//   static async verifyOTP(req, res) {

//     try {

//       const response =await ManufacturerService.verifyManufacturerOTP(req.body);

//       return res.status(200).json(response);

//     } catch (error) {

//       return res.status(
//         error.statusCode || 500
//       ).json({
//         success: false,
//         message:
//           error.message ||
//           "OTP verification failed"
//       });

//     }

//   }

//   /**
//    * ONBOARD
//    */

//   static async onboard(req, res) {

//     try {

//       const response =
//         await ManufacturerService
//           .onboardManufacturer(req.body);

//       return res.status(201).json({
//         success: true,
//         message:
//           "Manufacturer registered successfully",
//         data: response,
//       });

//     } catch (error) {

//       return res.status(
//         error.statusCode || 500
//       ).json({
//         success: false,
//         message:
//           error.message ||
//           "Unable to complete sign up."
//       });

//     }

//   }

//   static async getDistributor(req, res) {

//     try {

//       const response =
//         await ManufacturerService.getDistributor(
//           req.auth
//         );

//       return res.status(200).json(response);

//     } catch (error) {

//       return res.status(
//         error.statusCode || 500
//       ).json({
//         success: false,
//         message:
//           error.message ||
//           "Unable to get Distributor.",
//       });

//     }

//   }

// }


//*********************************MANUFACTURER SERVICE************************/
// import bcrypt from 'bcrypt';
// import crypto from 'crypto';
// import validator from "validator";
// import { db } from '../../config/database.js';
// import { ManufacturerRepository } from './manufacturer.repository.js';

// export class ManufacturerService {

//   static async onboardManufacturer(payload) {

//     const connection = await db.getConnection();

//     try {

//       await connection.beginTransaction();

//       // const existingManufacturer =await ManufacturerRepository.findManufacturerByCode(
//       //     payload.manufacturer_code,
//       //     connection
//       //   );

//       // if (existingManufacturer) {
//       //   throw new Error('Manufacturer code already exists');
//       // }
//       if (!validator.isEmail(payload.admin_email)) {
//         throw new Error("Invalid Email");
//       }

//       if (!validator.isMobilePhone(payload.admin_mobile, "en-IN")) {
//         const error = new Error("Invalid Mobile number");
//         error.statusCode = 400;
//         throw error;
//       }

//       const existingUser = await ManufacturerRepository.findUserByEmail(
//         payload.admin_email,
//         connection
//       );

//       if (existingUser) {
//         throw new Error('Admin email already exists');
//       }

//       // CREATE MANUFACTURER

//       const manufacturerId = await ManufacturerRepository.createManufacturer({
//         manufacturer_code: payload.manufacturer_code,
//         company_name: payload.company_name,
//         gst_number: payload.gst_number,
//         pan_number: payload.pan_number,
//         email: payload.company_email,
//         mobile: payload.company_mobile,
//         address: payload.address
//       }, connection);

//       // CREATE ROLE

//       // let role =await ManufacturerRepository.getRole(
//       //     manufacturerId,
//       //     connection
//       //   );

//       let roleId;

//       // if (!role) {
//       roleId = await ManufacturerRepository.createRole(
//         manufacturerId,
//         connection
//       );
//       // } else {
//       //   roleId = role.id;
//       // }

//       // HASH PASSWORD

//       const passwordHash = await bcrypt.hash(
//         payload.password,
//         10
//       );

//       // CREATE USER

//       const userId = await ManufacturerRepository.createUser({
//         manufacturer_id: manufacturerId,
//         employee_code: `MFG-00${manufacturerId}`,
//         first_name: payload.first_name,
//         last_name: payload.last_name,
//         email: payload.admin_email,
//         mobile: payload.admin_mobile,
//         password_hash: passwordHash
//       }, connection);

//       // ASSIGN ROLE

//       await ManufacturerRepository.assignRole(
//         userId,
//         roleId,
//         connection
//       );

//       // GENERATE API KEY

//       const rawApiKey = crypto.randomBytes(32).toString('hex');

//       await ManufacturerRepository.createApiKey({
//         manufacturer_id: manufacturerId,
//         user_id: userId,
//         api_key: rawApiKey,
//         key_name: `${payload.company_name} System Key`
//       }, connection);

//       await connection.commit();

//       return {
//         success: true,
//         message: 'Manufacturer onboarded successfully',
//         data: {
//           manufacturer_id: manufacturerId,
//           admin_user_id: userId,
//           api_key: rawApiKey
//         }
//       };

//     } catch (error) {

//       await connection.rollback();
//       throw error;

//     } finally {

//       connection.release();

//     }
//   }
// }


//******************************MANUFACTURER REPOSITORY*****************/
  //   static async createManufacturer(payload, connection = db) {
  //     const [result] = await connection.query(
  //       `
  //       INSERT INTO manufacturers (
  //         manufacturer_code,
  //         company_name,
  //         gst_number,
  //         pan_number,
  //         email,
  //         mobile,
  //         address,
  //         status
  //       )
  
  //       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  //       `,
  //       [
  //         payload.manufacturer_code,
  //         payload.company_name,
  //         payload.gst_number,
  //         payload.pan_number,
  //         payload.email,
  //         payload.mobile,
  //         payload.address,
  //         'ACTIVE'
  //       ]
  //     );

  //     return result.insertId;
  //   }


  //*********************************************MAIL SERVICES***********************/
  // import nodemailer from "nodemailer";
// import dotenv from "dotenv";

// dotenv.config();

// const transporter = nodemailer.createTransport({

//   host: "smtp.gmail.com",

//   port: 587,

//   secure: false,

//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },

//   tls: {
//     rejectUnauthorized: false,
//   },

// });

// export const sendOTP = async (email, otp) => {

//   return await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: "Email Verification OTP",
//     html: `
//       <h2>Email Verification</h2>
//       <h1>${otp}</h1>
//     `,
//   });

// };

// export const sendApiKey = async (
//   email,
//   apiKey,
//   companyName,
//   adminName
// ) => {

//   return await transporter.sendMail({

//     from: process.env.EMAIL_USER,

//     to: email,

//     subject: "Manufacturer API Key",

//     html: `
//       <h2>Welcome ${adminName}</h2>

//       <p>
//         Manufacturer account for
//         <strong>${companyName}</strong>
//         created successfully.
//       </p>

//       <p>Your API Key:</p>

//       <pre
//         style="
//           background:#f4f4f4;
//           padding:15px;
//           border-radius:5px;
//         "
//       >
// ${apiKey}
//       </pre>

//       <p>Keep this API key secure.</p>
//     `,
//   });

// };
 // export const sendOTP = async (email, otp) => {

//   try {

//     const response = await resend.emails.send({

//       from: "onboarding@resend.dev",

//       to: email,

//       subject: "Email Verification OTP",

//       html: `
//         <div style="
//           font-family: Arial;
//           padding: 20px;
//         ">

//           <h2>Email Verification</h2>

//           <p>Your OTP is:</p>

//           <div style="
//             background: #f4f4f4;
//             padding: 15px;
//             font-size: 24px;
//             font-weight: bold;
//             border-radius: 5px;
//             width: fit-content;
//           ">
//             ${otp}
//           </div>

//         </div>
//       `,
//     });

//     return response;

//   } catch (error) {

//     console.log("OTP Email Error:", error);

//     throw error;

//   }

// };

// export const insertInvoicesBulk = (conn, rows) => {
//   return conn.query(
//     `INSERT INTO sales 
//     (distributor_id, manufacturer_id,uuid, guid, voucher_number, voucher_type, invoice_date, effective_date,
//      party_name, party_ledger_name, party_gstin, company_gstin,
//      place_of_supply, state_name, cmpstate,	consigneestate,narration, sub_total, total_amount, created_by)
//     VALUES ?
//     ON DUPLICATE KEY UPDATE 
//       voucher_number = VALUES(voucher_number),
//       voucher_type = VALUES(voucher_type),
//       invoice_date = VALUES(invoice_date),
//       effective_date = VALUES(effective_date),
//       party_name = VALUES(party_name),
//       party_ledger_name = VALUES(party_ledger_name),
//       party_gstin = VALUES(party_gstin),
//       company_gstin = VALUES(company_gstin),
//       place_of_supply = VALUES(place_of_supply),
//       state_name = VALUES(state_name),
//       cmpstate = VALUES(cmpstate),
//     	consigneestate = VALUES(consigneestate),
//       narration = VALUES(narration),
//       sub_total = VALUES(sub_total),
//       total_amount = VALUES(total_amount),
//       updated_at = CURRENT_TIMESTAMP`,
//     [rows]
//   );
// };

// ***********************************************Distributor Service **************************//

  // async bulkOnboardDistributors(filePath, currentUser) {

  //   const workbook = XLSX.readFile(filePath);

  //   const sheetName = workbook.SheetNames[0];

  //   const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  //   const results = [];
  //   const failures = [];

  //   for (let index = 0; index < rows.length; index++) {

  //     const row = rows[index];

  //     const connection = await db.getConnection();

  //     try {

  //       await connection.beginTransaction();

  //       /**
  //        * VALIDATION
  //        */

  //       if (!row.userEmail) {
  //         throw new Error(
  //           "User email missing"
  //         );
  //       }

  //       /**
  //        * CHECK USER EMAIL
  //        */

  //       const existingUser = await this.repository.checkUserEmail(
  //         connection,
  //         row.userEmail
  //       );

  //       if (existingUser) {
  //         throw new Error(
  //           "Email already exists"
  //         );
  //       }

  //       /**
  //        * PASSWORD
  //        */

  //       const password = `${row.first_name}@321`;

  //       const hashedPassword = await bcrypt.hash(password, 10);

  //       /**
  //        * PAYLOAD
  //        */

  //       const payload = {

  //         business_name: row.business_name,

  //         owner_name: row.owner_name,

  //         gst_number: row.gst_number,

  //         pan_number: row.pan_number,

  //         email: row.company_email,

  //         mobile: row.company_mobile,

  //         address: row.company_address,

  //         state_name: row.state_name,

  //         city_name: row.city_name,

  //         pincode: row.pincode,

  //         role_name: "Distributor",

  //         permission_ids: [1, 2, 3],

  //         admin_user: {

  //           first_name: row.first_name,

  //           last_name: row.last_name,

  //           email: row.userEmail,

  //           mobile: row.userMobile,

  //           password
  //         }
  //       };

  //       /**
  //        * CREATE DISTRIBUTOR
  //        */

  //       const distributorId = await this.repository.createDistributor(
  //         connection,
  //         payload,
  //         currentUser.manufacturerId,
  //         currentUser.distributorId
  //       );

  //       /**
  //        * DISTRIBUTOR CODE
  //        */

  //       const distributorCode = await this.repository.updateDistributorCode(
  //         connection,
  //         distributorId
  //       );

  //       /**
  //        * CREATE ROLE
  //        */

  //       const roleId = await this.repository.createRole(
  //         connection,
  //         currentUser.manufacturerId,
  //         payload.role_name
  //       );

  //       /**
  //        * MAP PERMISSIONS
  //        */

  //       await this.repository.mapRolePermissions(
  //         connection,
  //         roleId,
  //         payload.permission_ids
  //       );

  //       /**
  //        * CREATE USER
  //        */

  //       const userId = await this.repository.createUser(
  //         connection,
  //         {
  //           manufacturer_id: currentUser.manufacturerId,

  //           distributor_id: distributorId,

  //           reporting_to_user_id: currentUser.userId,

  //           user_type: "DISTRIBUTOR",

  //           first_name: payload.admin_user.first_name,

  //           last_name: payload.admin_user.last_name,

  //           email: payload.admin_user.email,

  //           mobile: payload.admin_user.mobile,

  //           password_hash: hashedPassword
  //         }
  //       );

  //       /**
  //        * ASSIGN ROLE
  //        */

  //       await this.repository.assignRoleToUser(
  //         connection,
  //         userId,
  //         roleId
  //       );

  //       /**
  //        * API KEY
  //        */

  //       const apiKey = await this.repository.createApiKey(
  //         connection,
  //         currentUser.manufacturerId,
  //         distributorId,
  //         userId,
  //         payload.role_name
  //       );

  //       await connection.commit();

  //       results.push({
  //         row: index + 1,
  //         distributor_id:
  //           distributorId,
  //         distributor_code:
  //           distributorCode,
  //         user_id: userId,
  //         api_key: apiKey
  //       });

  //     } catch (error) {

  //       await connection.rollback();

  //       failures.push({
  //         row: index + 1,
  //         email: row.userEmail,
  //         reason: error.message
  //       });

  //     } finally {

  //       connection.release();
  //       if (filePath && fs.existsSync(filePath)) {
  //         fs.unlink(filePath, (err) => {
  //           if (err) {
  //             console.log("File delete failed:", err.message);
  //           }
  //         });
  //       }
  //     }

  //   }

  //   return {
  //     success: true,
  //     total: rows.length,
  //     success_count:
  //       results.length,
  //     failed_count:
  //       failures.length,
  //     failures,
  //     results
  //   };

  // }
 
//   async bulkOnboardDistributors(
//   filePath,
//   currentUser
// ) {

//   try {

//     /**
//      * READ EXCEL
//      */

//     const workbook = XLSX.readFile(filePath);

//     const sheetName = workbook.SheetNames[0];

//     const rows =XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

//     /**
//      * REQUIRED COLUMNS
//      */

//     const requiredColumns = [

//       "business_name",
//       "owner_name",
//       "gst_number",
//       "pan_number",
//       "company_email",
//       "company_mobile",
//       "company_address",
//       "state_name",
//       "city_name",
//       "pincode",
//       "first_name",
//       "last_name",
//       "userEmail",
//       "userMobile"

//     ];

//     /**
//      * VALIDATE COLUMNS
//      */

//     if (!rows.length) {
//       throw new Error(
//         "Excel file is empty"
//       );
//     }

//     const firstRowKeys =
//       Object.keys(rows[0]);

//     for (const column of requiredColumns) {

//       if (!firstRowKeys.includes(column)) {

//         throw new Error(
//           `Missing column: ${column}`
//         );

//       }

//     }

//     /**
//      * CHECK DUPLICATE EMAILS INSIDE EXCEL
//      */

//     const emailSet = new Set();

//     for (const row of rows) {

//       if (
//         emailSet.has(row.userEmail)
//       ) {

//         throw new Error(
//           `Duplicate email in excel: ${row.userEmail}`
//         );

//       }

//       emailSet.add(row.userEmail);

//     }

//     /**
//      * RESULTS
//      */

//     const results = [];
//     const failures = [];

//     /**
//      * LOOP ROWS
//      */

//     for (
//       let index = 0;
//       index < rows.length;
//       index++
//     ) {

//       const row = rows[index];

//       const connection =
//         await db.getConnection();

//       try {

//         await connection.beginTransaction();

//         /**
//          * REQUIRED FIELD VALIDATION
//          */

//         if (
//           !row.business_name ||
//           !row.owner_name ||
//           !row.userEmail ||
//           !row.first_name ||
//           !row.company_mobile
//         ) {

//           throw new Error(
//             "Required fields missing"
//           );

//         }

//         /**
//          * CHECK EMAIL EXISTS
//          */

//         const existingUser =
//           await this.repository.checkUserEmail(
//             connection,
//             row.userEmail
//           );

//         if (existingUser) {

//           throw new Error(
//             "Email already exists"
//           );

//         }

//         /**
//          * CHECK GST EXISTS
//          */

//         const existingGST =
//           await this.repository.checkDistributorGST(
//             connection,
//             row.gst_number
//           );

//         if (existingGST) {

//           throw new Error(
//             "GST already exists"
//           );

//         }

//         /**
//          * CHECK PAN EXISTS
//          */

//         const existingPAN =
//           await this.repository.checkDistributorPAN(
//             connection,
//             row.pan_number
//           );

//         if (existingPAN) {

//           throw new Error(
//             "PAN already exists"
//           );

//         }

//         /**
//          * PASSWORD
//          */

//         const password =
//           `${row.first_name}@321`;

//         const hashedPassword =
//           await bcrypt.hash(
//             password,
//             10
//           );

//         /**
//          * PAYLOAD
//          */

//         const payload = {

//           business_name:
//             row.business_name,

//           owner_name:
//             row.owner_name,

//           gst_number:
//             row.gst_number,

//           pan_number:
//             row.pan_number,

//           email:
//             row.company_email,

//           mobile:
//             row.company_mobile,

//           address:
//             row.company_address,

//           state_name:
//             row.state_name,

//           city_name:
//             row.city_name,

//           pincode:
//             row.pincode,

//           role_name:
//             "Distributor",

//           permission_ids: [1,2,3],

//           admin_user: {

//             first_name:
//               row.first_name,

//             last_name:
//               row.last_name,

//             email:
//               row.userEmail,

//             mobile:
//               row.userMobile,

//             password

//           }

//         };

//         /**
//          * CREATE DISTRIBUTOR
//          */

//         const distributorId =
//           await this.repository.createDistributor(
//             connection,
//             payload,
//             currentUser.manufacturerId,
//             currentUser.distributorId
//           );

//         /**
//          * GENERATE DISTRIBUTOR CODE
//          */

//         const distributorCode =
//           await this.repository.updateDistributorCode(
//             connection,
//             distributorId
//           );

//         /**
//          * CREATE ROLE
//          */

//         const roleId =
//           await this.repository.createRole(
//             connection,
//             currentUser.manufacturerId,
//             payload.role_name
//           );

//         /**
//          * MAP ROLE PERMISSIONS
//          */

//         await this.repository.mapRolePermissions(
//           connection,
//           roleId,
//           payload.permission_ids
//         );
// but is restapi not gaphql

//         /**
//          * CREATE USER
//          */

//         const userId =
//           await this.repository.createUser(
//             connection,
//             {
//               manufacturer_id:
//                 currentUser.manufacturerId,

//               distributor_id:
//                 distributorId,

//               reporting_to_user_id:
//                 currentUser.userId,

//               user_type:
//                 "DISTRIBUTOR",

//               first_name:
//                 payload.admin_user.first_name,

//               last_name:
//                 payload.admin_user.last_name,

//               email:
//                 payload.admin_user.email,

//               mobile:
//                 payload.admin_user.mobile,

//               password_hash:
//                 hashedPassword
//             }
//           );

//         /**
//          * ASSIGN ROLE
//          */

//         await this.repository.assignRoleToUser(
//           connection,
//           userId,
//           roleId
//         );

//         /**
//          * CREATE API KEY
//          */

//         const apiKey =
//           await this.repository.createApiKey(
//             connection,
//             currentUser.manufacturerId,
//             distributorId,
//             userId,
//             payload.role_name
//           );

//         /**
//          * COMMIT
//          */

//         await connection.commit();

//         /**
//          * SUCCESS
//          */

//         results.push({

//           row: index + 1,

//           distributor_id:
//             distributorId,

//           distributor_code:
//             distributorCode,

//           user_id:
//             userId,

//           api_key:
//             apiKey

//         });

//       } catch (error) {

//         /**
//          * ROLLBACK ONLY ROW
//          */
//          console.log(error)
//         await connection.rollback();

//         failures.push({

//           row: index + 1,

//           email:
//             row.userEmail,

//           reason:
//             error.message

//         });

//       } finally {

//         connection.release();

//       }

//     }

//     /**
//      * FINAL RESPONSE
//      */

//     return {

//       success: true,

//       total:
//         rows.length,

//       success_count:
//         results.length,

//       failed_count:
//         failures.length,

//       failures,

//       results

//     };

//   } catch (error) {

//     throw error;

//   } finally {

//     /**
//      * DELETE EXCEL FILE
//      */

//     if (
//       filePath &&
//       fs.existsSync(filePath)
//     ) {

//       fs.unlink(
//         filePath,
//         (err) => {

//           if (err) {

//             console.log(
//               "File delete failed:",
//               err.message
//             );

//           }

//         }
//       );

//     }

//   }

// }

// async bulkOnboardDistributors(filePath,currentUser) {

//   try {

//     /**
//      * READ EXCEL
//      */

//     const workbook =XLSX.readFile(filePath);

//     const sheetName =workbook.SheetNames[0];

//     const rows =XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

//     /**
//      * EMPTY FILE CHECK
//      */

//     if (!rows.length) {

//       throw new Error(
//         "Excel file is empty"
//       );

//     }

//     /**
//      * REQUIRED COLUMNS
//      */

//     const requiredColumns = [

//       "business_name",
//       "owner_name",
//       "gst_number",
//       "pan_number",
//       "company_email",
//       "company_mobile",
//       "company_address",
//       "state_name",
//       "city_name",
//       "pincode",
//       "first_name",
//       "last_name",
//       "userEmail",
//       "userMobile"

//     ];

//     /**
//      * VALIDATE COLUMNS
//      */

//     const firstRowKeys = Object.keys(rows[0]);

//     for (const column of requiredColumns) {

//       if (!firstRowKeys.includes(column)) {

//         throw new Error(`Missing column: ${column}`);
//       }
//     }

//     /**
//      * CHECK DUPLICATE EMAILS INSIDE EXCEL
//      */

//     const emailSet = new Set();

//     for (const row of rows) {

//       const email =
//         String(row.userEmail || "").trim();

//       if (emailSet.has(email)) {

//         throw new Error(
//           `Duplicate email in excel: ${email}`
//         );

//       }

//       emailSet.add(email);

//     }

//     /**
//      * RESULTS
//      */

//     const results = [];
//     const failures = [];

//     /**
//      * LOOP ROWS
//      */

//     for (let index = 0;index < rows.length;index++) {

//       const row = rows[index];

//       /**
//        * NORMALIZE ROW
//        */

//       const normalizedRow = {

//         business_name:String(row.business_name || "").trim(),

//         owner_name:String(row.owner_name || "").trim(),

//         gst_number:String(row.gst_number || "").trim(),

//         pan_number:String(row.pan_number || "").trim(),

//         company_email:String(row.company_email || "" ).trim(),

//         company_mobile:String(row.company_mobile || "").trim(),

//         company_address: String(row.company_address || "" ).trim(),

//         state_name:String(row.state_name || "").trim(),

//         city_name: String(row.city_name || "").trim(),

//         pincode:String(row.pincode || "").trim(),

//         first_name:String(row.first_name || "").trim(),

//         last_name:String( row.last_name || "").trim(),

//         userEmail: String(row.userEmail || "" ).trim(),

//         userMobile: String( row.userMobile || "" ).trim()

//       };

//       /**
//        * DB CONNECTION
//        */
//       console.log(normalizedRow)
//       const connection =await db.getConnection();
//  can i leave the company without serving notice period it causes any problem in future
//       try {

//         /**
//          * BEGIN TRANSACTION
//          */

//         await connection.beginTransaction();

//         /**
//          * REQUIRED FIELD VALIDATION
//          */

//         for (const [key, value] of Object.entries(normalizedRow) ) {

//           if (
//             value === undefined ||
//             value === null ||
//             String(value).trim() === ""
//           ) {

//             throw new Error(
//               `${key} is required`
//             );

//           }

//         }

//         /**
//          * CHECK USER EMAIL
//          */

//         const existingUser =await this.repository.checkUserEmail(
//             connection,
//             normalizedRow.userEmail
//           );

//         if (existingUser) {

//           throw new Error(
//             "Email already exists"
//           );

//         }

//         /**
//          * CHECK GST
//          */

//         const existingGST =await this.repository.checkDistributorGST(
//             connection,
//             normalizedRow.gst_number
//           );

//         if (existingGST) {

//           throw new Error(
//             "GST already exists"
//           );

//         }

//         /**
//          * CHECK PAN
//          */

//         const existingPAN =await this.repository.checkDistributorPAN(
//             connection,
//             normalizedRow.pan_number
//           );

//         if (existingPAN) {

//           throw new Error(
//             "PAN already exists"
//           );

//         }

//         /**
//          * PASSWORD
//          */

//         const password = `${normalizedRow.first_name}@321`;

//         const hashedPassword =await bcrypt.hash(  password, 10    );

//         /**
//          * PAYLOAD
//          */

//         const payload = {

//           business_name: normalizedRow.business_name,

//           owner_name:normalizedRow.owner_name,

//           gst_number: normalizedRow.gst_number,

//           pan_number:normalizedRow.pan_number,

//           email: normalizedRow.company_email,

//           mobile:normalizedRow.company_mobile,

//           address:normalizedRow.company_address,

//           state_name:normalizedRow.state_name,

//           city_name:normalizedRow.city_name,

//           pincode:normalizedRow.pincode,

//           role_name:"Distributor",

//           permission_ids: [1,2,3],

//           admin_user: {

//             first_name:normalizedRow.first_name,

//             last_name:normalizedRow.last_name,

//             email:normalizedRow.userEmail,

//             mobile: normalizedRow.userMobile,

//             password

//           }

//         };

//         /**
//          * CREATE DISTRIBUTOR
//          */

//         const distributorId = await this.repository.createDistributor(
//             connection,
//             payload,
//             currentUser.manufacturerId,
//             currentUser.distributorId
//           );

//         /**
//          * UPDATE DISTRIBUTOR CODE
//          */

//         const distributorCode = await this.repository.updateDistributorCode(
//             connection,
//             distributorId
//           );

//         /**
//          * CREATE ROLE
//          */

//         const roleId =await this.repository.createRole(
//             connection,
//             currentUser.manufacturerId,
//             payload.role_name
//           );

//         /**
//          * MAP ROLE PERMISSIONS
//          */

//         await this.repository.mapRolePermissions(
//           connection,
//           roleId,
//           payload.permission_ids
//         );

//         /**
//          * CREATE USER
//          */

//         const userId =await this.repository.createUser(
//             connection,
//             {
//               manufacturer_id:currentUser.manufacturerId,

//               distributor_id: distributorId,

//               reporting_to_user_id:currentUser.userId,

//               user_type: "DISTRIBUTOR",

//               first_name:payload.admin_user.first_name,

//               last_name:payload.admin_user.last_name,

//               email:  payload.admin_user.email,

//               mobile:payload.admin_user.mobile,

//               password_hash: hashedPassword
//             }
//           );

//         /**
//          * ASSIGN ROLE
//          */

//         await this.repository.assignRoleToUser(
//           connection,
//           userId,
//           roleId
//         );

//         /**
//          * CREATE API KEY
//          */

//         const apiKey =await this.repository.createApiKey(
//             connection,
//             currentUser.manufacturerId,
//             distributorId,
//             userId,
//             payload.role_name
//           );

//         /**
//          * COMMIT
//          */

//         await connection.commit();

//         /**
//          * SUCCESS
//          */

//         results.push({

//           row: index + 1,

//           distributor_id:distributorId,

//           distributor_code:distributorCode,

//           user_id: userId,

//           api_key: apiKey

//         });

//       } catch (error) {

//         /**
//          * ROLLBACK
//          */

//         await connection.rollback();

//         failures.push({

//           row: index + 1,

//           email:normalizedRow.userEmail,

//           reason:error.message

//         });

//       } finally {

//         connection.release();

//       }

//     }

//     /**
//      * FINAL RESPONSE
//      */

//     return {

//       success: true,

//    whether it slows the database insert or it is ok  total:rows.length,

//       success_count: results.length,

//       failed_count: failures.length,

//       failures,

//       results

//     };

//   } catch (error) {

//     throw error;

//   } finally {

//     /**
//      * DELETE EXCEL FILE
//      */

//     if ( filePath &&fs.existsSync(filePath)) {
//       console.log(filePath)
//       fs.unlink(filePath,(err) => {
//           if (err) {
//             console.log(
//               "File delete failed:",
//               err.message
//             );

//           }

//         }
//       );

//     }

//   }

// }
// async bulkOnboardDistributors(filePath, currentUser) {

//   try {

//     /**
//      * READ EXCEL
//      */

//     const workbook = XLSX.readFile(filePath);

//     const sheetName = workbook.SheetNames[0];

//     const rows = XLSX.utils.sheet_to_json(
//       workbook.Sheets[sheetName]
//     );

//     /**
//      * EMPTY FILE CHECK
//      */

//     if (!rows.length) {

//       throw new Error(
//         "Excel file is empty"
//       );

//     }

//     /**
//      * REQUIRED COLUMNS
//      */

//     const requiredColumns = [

//       "business_name",
//       "owner_name",
//       "gst_number",
//       "pan_number",
//       "company_email",
//       "company_mobile",
//       "company_address",
//       "state_name",
//       "city_name",
//       "pincode",
//       "first_name",
//       "last_name",
//       "userEmail",
//       "userMobile"

//     ];

//     /**
//      * VALIDATE COLUMNS
//      */

//     const firstRowKeys = Object.keys(rows[0]);

//     for (const column of requiredColumns) {

//       if (!firstRowKeys.includes(column)) {

//         throw new Error(
//           `Missing column: ${column}`
//         );

//       }

//     }

//     /**
//      * CHECK DUPLICATE EMAILS INSIDE EXCEL
//      */

//     const emailSet = new Set();

//     for (const row of rows) {

//       const email = String(
//         row.userEmail || ""
//       ).trim();

//       if (emailSet.has(email)) {

//         throw new Error(
//           `Duplicate email in excel: ${email}`
//         );

//       }

//       emailSet.add(email);

//     }

//     /**
//      * RESULTS
//      */

//     const results = [];

//     const failures = [];

//     /**
//      * LOOP ROWS
//      */

//     for (
//       let index = 0;
//       index < rows.length;
//       index++
//     ) {

//       const row = rows[index];

//       /**
//        * NORMALIZE ROW
//        */

//       const normalizedRow = {

//         business_name: String(
//           row.business_name || ""
//         ).trim(),

//         owner_name: String(
//           row.owner_name || ""
//         ).trim(),

//         gst_number: String(
//           row.gst_number || ""
//         ).trim(),

//         pan_number: String(
//           row.pan_number || ""
//         ).trim(),

//         company_email: String(
//           row.company_email || ""
//         ).trim(),

//         company_mobile: String(
//           row.company_mobile || ""
//         ).trim(),

//         company_address: String(
//           row.company_address || ""
//         ).trim(),

//         state_name: String(
//           row.state_name || ""
//         ).trim(),

//         city_name: String(
//           row.city_name || ""
//         ).trim(),

//         pincode: String(
//           row.pincode || ""
//         ).trim(),

//         first_name: String(
//           row.first_name || ""
//         ).trim(),

//         last_name: String(
//           row.last_name || ""
//         ).trim(),

//         userEmail: String(
//           row.userEmail || ""
//         ).trim(),

//         userMobile: String(
//           row.userMobile || ""
//         ).trim()

//       };

//       console.log(normalizedRow);

//       /**
//        * DB CONNECTION
//        */

//       const connection = await db.getConnection();

//       try {

//         /**
//          * BEGIN TRANSACTION
//          */

//         await connection.beginTransaction();

//         /**
//          * REQUIRED FIELD VALIDATION
//          * CHECK ALL EMPTY FIELDS
//          */

//         const missingFields = [];

//         for (
//           const [key, value]
//           of Object.entries(normalizedRow)
//         ) {

//           if (
//             value === undefined ||
//             value === null ||
//             String(value).trim() === ""
//           ) {

//             missingFields.push(key);

//           }

//         }

//         if (missingFields.length > 0) {

//           throw new Error(
//             `Missing required fields: ${missingFields.join(", ")}`
//           );

//         }

//         /**
//          * CHECK USER EMAIL
//          */

//         const existingUser =
//           await this.repository.checkUserEmail(
//             connection,
//             normalizedRow.userEmail
//           );

//         if (existingUser) {

//           throw new Error(
//             "Email already exists"
//           );

//         }

//         /**
//          * CHECK GST
//          */

//         const existingGST =
//           await this.repository.checkDistributorGST(
//             connection,
//             normalizedRow.gst_number
//           );

//         if (existingGST) {

//           throw new Error(
//             "GST already exists"
//           );

//         }

//         /**
//          * CHECK PAN
//          */

//         const existingPAN =
//           await this.repository.checkDistributorPAN(
//             connection,
//             normalizedRow.pan_number
//           );

//         if (existingPAN) {

//           throw new Error(
//             "PAN already exists"
//           );

//         }

//         /**
//          * PASSWORD
//          */

//         const password =
//           `${normalizedRow.first_name}@321`;

//         const hashedPassword =
//           await bcrypt.hash(password, 10);

//         /**
//          * PAYLOAD
//          */

//         const payload = {

//           business_name:
//             normalizedRow.business_name,

//           owner_name:
//             normalizedRow.owner_name,

//           gst_number:
//             normalizedRow.gst_number,

//           pan_number:
//             normalizedRow.pan_number,

//           email:
//             normalizedRow.company_email,

//           mobile:
//             normalizedRow.company_mobile,

//           address:
//             normalizedRow.company_address,

//           state_name:
//             normalizedRow.state_name,

//           city_name:
//             normalizedRow.city_name,

//           pincode:
//             normalizedRow.pincode,

//           role_name: "Distributor",

//           permission_ids: [1, 2, 3],

//           admin_user: {

//             first_name:
//               normalizedRow.first_name,

//             last_name:
//               normalizedRow.last_name,

//             email:
//               normalizedRow.userEmail,

//             mobile:
//               normalizedRow.userMobile,

//             password

//           }

//         };

//         /**
//          * CREATE DISTRIBUTOR
//          */

//         const distributorId =
//           await this.repository.createDistributor(
//             connection,
//             payload,
//             currentUser.manufacturerId,
//             currentUser.distributorId
//           );

//         /**
//          * UPDATE DISTRIBUTOR CODE
//          */

//         const distributorCode =
//           await this.repository.updateDistributorCode(
//             connection,
//             distributorId
//           );

//         /**
//          * CREATE ROLE
//          */

//         const roleId =
//           await this.repository.createRole(
//             connection,
//             currentUser.manufacturerId,
//             payload.role_name
//           );

//         /**
//          * MAP ROLE PERMISSIONS
//          */

//         await this.repository.mapRolePermissions(
//           connection,
//           roleId,
//           payload.permission_ids
//         );

//         /**
//          * CREATE USER
//          */

//         const userId =
//           await this.repository.createUser(
//             connection,
//             {
//               manufacturer_id:
//                 currentUser.manufacturerId,

//               distributor_id:
//                 distributorId,

//               reporting_to_user_id:
//                 currentUser.userId,

//               user_type:
//                 "DISTRIBUTOR",

//               first_name:
//                 payload.admin_user.first_name,

//               last_name:
//                 payload.admin_user.last_name,

//               email:
//                 payload.admin_user.email,

//               mobile:
//                 payload.admin_user.mobile,

//               password_hash:
//                 hashedPassword
//             }
//           );

//         /**
//          * ASSIGN ROLE
//          */

//         await this.repository.assignRoleToUser(
//           connection,
//           userId,
//           roleId
//         );

//         /**
//          * CREATE API KEY
//          */

//         const apiKey =
//           await this.repository.createApiKey(
//             connection,
//             currentUser.manufacturerId,
//             distributorId,
//             userId,
//             payload.role_name
//           );

//         /**
//          * COMMIT
//          */

//         await connection.commit();

//         /**
//          * SUCCESS
//          */

//         results.push({

//           row: index + 1,

//           distributor_id:
//             distributorId,

//           distributor_code:
//             distributorCode,

//           user_id:
//             userId,

//           api_key:
//             apiKey

//         });

//       } catch (error) {

//         /**
//          * ROLLBACK
//          */

//         await connection.rollback();

//         /**
//          * FAILURE
//          */
//         failures.push({

//           row: index + 1,

//           email:
//             normalizedRow.userEmail || null,

//           reason:
//             error.message

//         });

//       } finally {

//         /**
//          * RELEASE CONNECTION
//          */

//         connection.release();

//       }

//     }

//     /**
//      * FINAL RESPONSE
//      */

//     return {

//       success: true,

//       total: rows.length,

//       success_count:
//         results.length,

//       failed_count:
//         failures.length,

//       failures,

//       results

//     };

//   } catch (error) {

//     throw error;

//   } finally {

//     /**
//      * DELETE EXCEL FILE
//      */

//     if (
//       filePath &&
//       fs.existsSync(filePath)
//     ) {

//       console.log(filePath);

//       fs.unlink(
//         filePath,
//         (err) => {

//           if (err) {

//             console.log(
//               "File delete failed:",
//               err.message
//             );

//           }

//         }
//       );

//     }

//   }

// }
// async bulkOnboardDistributors(
//   filePath,
//   currentUser
// ) {

//   try {

//     /**
//      * READ EXCEL
//      */

//     const workbook =
//       XLSX.readFile(filePath);

//     const sheetName =
//       workbook.SheetNames[0];

//     const rows =
//       XLSX.utils.sheet_to_json(
//         workbook.Sheets[sheetName]

//     /**
//      * EMPTY FILE CHECK
//      */

//     if (!rows.length) {

//       throw new Error(
//         "Excel file is empty"
//       );

//     }

//     /**
//      * REQUIRED COLUMNS
//      */

//     const requiredColumns = [

//       "business_name",
//       "owner_name",
//       "gst_number",
//       "pan_number",
//       "company_email",
//       "company_mobile",
//       "company_address",
//       "state_name",
//       "city_name",
//       "pincode",
//       "first_name",
//       "last_name",
//       "userEmail",
//       "userMobile"

//     ];

//     /**
//      * VALIDATE COLUMNS
//      */

//     const firstRowKeys =
//       Object.keys(rows[0]);

//     for (const column of requiredColumns) {

//       if (
//         !firstRowKeys.includes(column)
//       ) {

//         throw new Error(
//           `Missing column: ${column}`
//         );

//       }

//     }

//     /**
//      * VALIDATION REGEX
//      */

//     const emailRegex =
//       /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//     const gstRegex =
//       /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

//     const panRegex =
//       /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

//     const mobileRegex =
//       /^[6-9]\d{9}$/;

//     const pincodeRegex =
//       /^\d{6}$/;

//     /**
//      * VALIDATION FAILURES
//      */

//     const validationFailures = [];

//     /**
//      * CHECK DUPLICATE EMAILS INSIDE EXCEL
//      */

//     const emailSet = new Set();

//     /**
//      * VALIDATE ALL ROWS FIRST
//      */

//     for (
//       let index = 0;
//       index < rows.length;
//       index++
//     ) {

//       const row = rows[index];

//       /**
//        * NORMALIZE ROW
//        */

//       const normalizedRow = {

//         business_name: String(
//           row.business_name || ""
//         ).trim(),

//         owner_name: String(
//           row.owner_name || ""
//         ).trim(),

//         gst_number: String(
//           row.gst_number || ""
//         ).trim().toUpperCase(),

//         pan_number: String(
//           row.pan_number || ""
//         ).trim().toUpperCase(),

//         company_email: String(
//           row.company_email || ""
//         ).trim(),

//         company_mobile: String(
//           row.company_mobile || ""
//         ).trim(),

//         company_address: String(
//           row.company_address || ""
//         ).trim(),

//         state_name: String(
//           row.state_name || ""
//         ).trim(),

//         city_name: String(
//           row.city_name || ""
//         ).trim(),

//         pincode: String(
//           row.pincode || ""
//         ).trim(),

//         first_name: String(
//           row.first_name || ""
//         ).trim(),

//         last_name: String(
//           row.last_name || ""
//         ).trim(),

//         userEmail: String(
//           row.userEmail || ""
//         ).trim(),

//         userMobile: String(
//           row.userMobile || ""
//         ).trim()
 
//       };

//       /**
//        * COLLECT ERRORS
//        */

//       const rowErrors = [];

//       /**
//        * REQUIRED FIELD VALIDATION
//        */

//       for (
//         const [key, value]
//         of Object.entries(normalizedRow)
//       ) {

//         if (
//           value === undefined ||
//           value === null ||
//           String(value).trim() === ""
//         ) {

//           rowErrors.push(
//             `${key} is required`
//           );

//         }

//       }

//       /**
//        * DUPLICATE EMAIL INSIDE EXCEL
//        */

//       if (
//         normalizedRow.userEmail
//       ) {

//         if (
//           emailSet.has(
//             normalizedRow.userEmail
//           )
//         ) {

//           rowErrors.push(
//             "Duplicate userEmail in excel"
//           );

//         } else {

//           emailSet.add(
//             normalizedRow.userEmail
//           );

//         }

//       }

//       /**
//        * EMAIL VALIDATION
//        */

//       if (
//         normalizedRow.company_email &&
//         !emailRegex.test(
//           normalizedRow.company_email
//         )
//       ) {

//         rowErrors.push(
//           "Invalid company_email"
//         );

//       }

//       if (
//         normalizedRow.userEmail &&
//         !emailRegex.test(
//           normalizedRow.userEmail
//         )
//       ) {

//         rowErrors.push(
//           "Invalid userEmail"
//         );

//       }

//       /**
//        * GST VALIDATION
//        */

//       if (
//         normalizedRow.gst_number &&
//         !gstRegex.test(
//           normalizedRow.gst_number
//         )
//       ) {

//         rowErrors.push(
//           "Invalid gst_number"
//         );

//       }

//       /**
//        * PAN VALIDATION
//        */

//       if (
//         normalizedRow.pan_number &&
//         !panRegex.test(
//           normalizedRow.pan_number
//         )
//       ) {

//         rowErrors.push(
//           "Invalid pan_number"
//         );

//       }

//       /**
//        * MOBILE VALIDATION
//        */

//       if (
//         normalizedRow.company_mobile &&
//         !mobileRegex.test(
//           normalizedRow.company_mobile
//         )
//       ) {

//         rowErrors.push(
//           "Invalid company_mobile"
//         );

//       }

//       if (
//         normalizedRow.userMobile &&
//         !mobileRegex.test(
//           normalizedRow.userMobile
//         )
//       ) {
// why my google chrome  and visual 
//         rowErrors.push(
//           "Invalid userMobile"
//         );

//       }

//       /**
//        * PINCODE VALIDATION
//        */

//       if (
//         normalizedRow.pincode &&
//         !pincodeRegex.test(
//           normalizedRow.pincode
//         )
//       ) {

//         rowErrors.push(
//           "Invalid pincode"
//         );

//       }

//       /**
//        * PUSH VALIDATION FAILURE
//        */

//       if (rowErrors.length > 0) {

//         validationFailures.push({

//           row: index + 1,

//           email:
//             normalizedRow.userEmail || null,

//           reason: rowErrors

//         });

//       }

//     }

//     /**
//      * STOP ENTIRE FILE
//      * IF VALIDATION FAILURES EXIST
//      */

//     if (
//       validationFailures.length > 0
//     ) {

//       return {

//         success: false,

//         message:
//           "Excel validation failed",

//         total: rows.length,

//         failed_count:
//           validationFailures.length,

//         failures:
//           validationFailures

//       };

//     }

//     /**
//      * RESULTS
//      */

//     const results = [];

//     const failures = [];

//     /**
//      * PROCESS ROWS
//      */
//     for (
//       let index = 0;
//       index < rows.length;
//       index++
//     ) {

//       const row = rows[index];

//       /**
//        * NORMALIZE ROW
//        */

//       const normalizedRow = {

//         business_name: String(
//           row.business_name || ""
//         ).trim(),

//         owner_name: String(
//           row.owner_name || ""
//         ).trim(),

//         gst_number: String(
//           row.gst_number || ""
//         ).trim().toUpperCase(),

//         pan_number: String(
//           row.pan_number || ""
//         ).trim().toUpperCase(),
 
//         company_email: String(
//           row.company_email || ""
//         ).trim(),

//         company_mobile: String(
//           row.company_mobile || ""
//         ).trim(),

//         company_address: String(
//           row.company_address || ""
//         ).trim(),

//         state_name: String(
//           row.state_name || ""
//         ).trim(),

//         city_name: String(
//           row.city_name || ""
//         ).trim(),

//         pincode: String(
//           row.pincode || ""
//         ).trim(),

//         first_name: String(
//           row.first_name || ""
//         ).trim(),

//         last_name: String(
//           row.last_name || ""
//         ).trim(),

//         userEmail: String(
//           row.userEmail || ""
//         ).trim(),

//         userMobile: String(
//           row.userMobile || ""
//         ).trim()

//       };

//       /**
//        * DB CONNECTION
//        */

//       const connection =
//         await db.getConnection();

//       try {

//         /**
//          * BEGIN TRANSACTION
//          */

//         await connection.beginTransaction();

//         /**
//          * CHECK USER EMAIL
//          */

//         const existingUser =
//           await this.repository.checkUserEmail(
//             connection,
//             normalizedRow.userEmail
//           );

//         if (existingUser) {

//           throw new Error(
//             "Email already exists"
//           );

//         }

//         /**
//          * CHECK GST
//          */

//         const existingGST =
//           await this.repository.checkDistributorGST(
//             connection,
//             normalizedRow.gst_number
//           );

//         if (existingGST) {

//           throw new Error(
//             "GST already exists"
//           );

//         }

//         /**
//          * CHECK PAN
//          */

//         const existingPAN =
//           await this.repository.checkDistributorPAN(
//             connection,
//             normalizedRow.pan_number
//           );

//         if (existingPAN) {

//           throw new Error(
//             "PAN already exists"
//           );

//         }

//         /**
//          * PASSWORD
//          */

//         const password =
//           `${normalizedRow.first_name}@321`;

//         const hashedPassword =
//           await bcrypt.hash(
//             password,
//             10
//           );

//         /**
//          * PAYLOAD
//          */

//         const payload = {

//           business_name:
//             normalizedRow.business_name,

//           owner_name:
//             normalizedRow.owner_name,

//           gst_number:
//             normalizedRow.gst_number,

//           pan_number:
//             normalizedRow.pan_number,

//           email:
//             normalizedRow.company_email,

//           mobile:
//             normalizedRow.company_mobile,

//           address:
//             normalizedRow.company_address,

//           state_name:
//             normalizedRow.state_name,

//           city_name:
//             normalizedRow.city_name,

//           pincode:
//             normalizedRow.pincode,

//           role_name:
//             "Distributor",

//           permission_ids:
//             [1, 2, 3],

//           admin_user: {

//             first_name:
//               normalizedRow.first_name,

//             last_name:
//               normalizedRow.last_name,

//             email:
//               normalizedRow.userEmail,

//             mobile:
//               normalizedRow.userMobile,

//             password

//           }

//         };

//         /**
//          * CREATE DISTRIBUTOR
//          */

//         const distributorId =
//           await this.repository.createDistributor(
//             connection,
//             payload,
//             currentUser.manufacturerId,
//             currentUser.distributorId
//           );

//         /**
//          * UPDATE DISTRIBUTOR CODE
//          */

//         const distributorCode =
//           await this.repository.updateDistributorCode(
//             connection,
//             distributorId
//           );

//         /**
//          * CREATE ROLE
//          */

//         const roleId =
//           await this.repository.createRole(
//             connection,
//             currentUser.manufacturerId,
//             payload.role_name
//           );

//         /**
//          * MAP ROLE PERMISSIONS
//          */

//         await this.repository.mapRolePermissions(
//           connection,
//           roleId,
//           payload.permission_ids
//         );

//         /**
//          * CREATE USER
//          */

//         const userId =
//           await this.repository.createUser(
//             connection,
//             {
//               manufacturer_id:
//                 currentUser.manufacturerId,

//               distributor_id:
//                 distributorId,

//               reporting_to_user_id:
//                 currentUser.userId,

//               user_type:
//                 "DISTRIBUTOR",

//               first_name:
//                 payload.admin_user.first_name,

//               last_name:
//                 payload.admin_user.last_name,

//               email:
//                 payload.admin_user.email,

//               mobile:
//                 payload.admin_user.mobile,

//               password_hash:
//                 hashedPassword
//             }
//           );

//         /**
//          * ASSIGN ROLE
//          */

//         await this.repository.assignRoleToUser(
//           connection,
//           userId,
//           roleId
//         );

//         /**
//          * CREATE API KEY
//          */

//         const apiKey =
//           await this.repository.createApiKey(
//             connection,
//             currentUser.manufacturerId,
//             distributorId,
//             userId,
//             payload.role_name
//           );

//         /**
//          * COMMIT
//          */

//         await connection.commit();

//         /**
//          * SUCCESS
//          */

//         results.push({

//           row: index + 1,

//           distributor_id:
//             distributorId,

//           distributor_code:
//             distributorCode,

//           user_id:
//             userId,

//           api_key:
//             apiKey

//         });

//       } catch (error) {

//         /**
//          * ROLLBACK
//          */

//         await connection.rollback();

//         /**
//          * FAILURE
//          */

//         failures.push({

//           row: index + 1,

//           email:
//             normalizedRow.userEmail,

//           reason:
//             error.message

//         });

//       } finally {

//         /**
//          * RELEASE CONNECTION
//          */

//         connection.release();

//       }

//     }

//     /**
//      * FINAL RESPONSE
//      */

//     return {

//       success: true,

//       total:
//         rows.length,

//       success_count:
//         results.length,

//       failed_count:
//         failures.length,

//       failures,

//       results

//     };

//   } catch (error) {

//     throw error;

//   } finally {

//     /**
//      * DELETE EXCEL FILE
//      */

//     if (
//       filePath &&
//       fs.existsSync(filePath)
//     ) {

//       fs.unlink(
//         filePath,
//         (err) => {

//           if (err) {

//             console.log(
//               "File delete failed:",
//               err.message
//             );

//           }

//         }
//       );

//     }

//   }

// }

// async bulkOnboardDistributors(filePath,currentUser) {

//   let connection;
//   try {

//     /**
//      * READ EXCEL
//      */

//     const workbook = XLSX.readFile(filePath);

//     const sheetName =workbook.SheetNames[0];

//     const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

//     /**
//      * EMPTY FILE CHECK
//      */

//     if (!rows.length) {

//       throw new Error("Excel file is empty");

//     }


//     const requiredColumns = [
//       "business_name",
//       "owner_name",
//       "gst_number",
//       "pan_number",
//       "company_email",
//       "company_mobile",
//       "company_address",
//       "state_name",
//       "city_name",
//       "pincode",
//       "first_name",
//       "last_name",
//       "userEmail",
//       "userMobile"

//     ];

//     /**
//      * VALIDATE COLUMNS
//      */

//     const firstRowKeys = Object.keys(rows[0]);

//     for (const column of requiredColumns) {

//       if (!firstRowKeys.includes(column)) {

//         throw new Error(
//           `Missing column: ${column}`
//         );

//       }

//     }

//     /**
//      * REGEX VALIDATIONS
//      */

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//     const gstRegex =/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

//     const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

//     const mobileRegex =/^[6-9]\d{9}$/;

//     const pincodeRegex =/^\d{6}$/;

//     /**
//      * VALIDATION FAILURES
//      */

//     const validationFailures = [];

//     /**
//      * DUPLICATE TRACKERS
//      */

//     const emailSet =new Set();

//     const gstSet =new Set();

//     const panSet =new Set();

//     /**
//      * NORMALIZED ROWS
//      */

//     const normalizedRows = [];

//     /**
//      * DB CONNECTION
//      */

//     connection = await db.getConnection();

//     /**
//      * =====================================
//      * VALIDATION PHASE
//      * =====================================
//      */

//     for (let index = 0;index < rows.length;index++) {

//       const row = rows[index];

//       /**
//        * NORMALIZE
//        */

//       const normalizedRow = {

//         business_name: String(row.business_name || "").trim(),

//         owner_name: String(row.owner_name || "").trim(),

//         gst_number: String(row.gst_number || "").trim().toUpperCase(),

//         pan_number: String(row.pan_number || "").trim().toUpperCase(),

//         company_email: String( row.company_email || "").trim(),

//         company_mobile: String(row.company_mobile || "").trim(),

//         company_address: String(row.company_address || "").trim(),

//         state_name: String(row.state_name || "").trim(),

//         city_name: String(row.city_name || "").trim(),

//         pincode: String(row.pincode || "").trim(),

//         first_name: String(row.first_name || "").trim(),

//         last_name: String(row.last_name || "").trim(),

//         userEmail: String(row.userEmail || "").trim(),

//         userMobile: String(row.userMobile || "").trim()

//       };

//       normalizedRows.push(normalizedRow);

//       /**
//        * ROW ERRORS
//        */

//       const rowErrors = [];

//       /**
//        * REQUIRED FIELD VALIDATION
//        */

//       for (const [key, value]of Object.entries(normalizedRow)) {
//         if (value === undefined ||value === null ||String(value).trim() === "" ) {
//           rowErrors.push( `${key} is required` );
//         }
//       }

//       /**
//        * EMAIL VALIDATION
//        */

//       if ( normalizedRow.company_email && !emailRegex.test( normalizedRow.company_email ) ) {

//         rowErrors.push(  "Invalid company_email" );

//       }

//       if (normalizedRow.userEmail &&!emailRegex.test( normalizedRow.userEmail )   ) {

//         rowErrors.push("Invalid userEmail"  );

//       }

//       /**
//        * GST VALIDATION
//        */

//       if ( normalizedRow.gst_number && !gstRegex.test( normalizedRow.gst_number ) ) {

//         rowErrors.push( "Invalid gst_number"  );

//       }

//       /**
//        * PAN VALIDATION
//        */

//       if ( normalizedRow.pan_number &&!panRegex.test( normalizedRow.pan_number ) ) {

//         rowErrors.push( "Invalid pan_number"  );

//       }

//       /**
//        * MOBILE VALIDATION
//        */

//       if (normalizedRow.company_mobile && !mobileRegex.test(normalizedRow.company_mobile )) {

//         rowErrors.push( "Invalid company_mobile" );

//       }

//       if ( normalizedRow.userMobile &&  !mobileRegex.test(  normalizedRow.userMobile)) {

//         rowErrors.push( "Invalid userMobile" );

//       }

//       /**
//        * PINCODE VALIDATION
//        */

//       if ( normalizedRow.pincode && !pincodeRegex.test(  normalizedRow.pincode )  ) {

//         rowErrors.push("Invalid pincode" );

//       }

//       /**
//        * DUPLICATE EMAIL INSIDE EXCEL
//        */

//       if (normalizedRow.userEmail) {

//         if ( emailSet.has(normalizedRow.userEmail ) ) {

//           rowErrors.push("Duplicate userEmail in excel" );

//         } else {

//           emailSet.add( normalizedRow.userEmail);

//         }

//       }

//       /**
//        * DUPLICATE GST INSIDE EXCEL
//        */

//       if ( normalizedRow.gst_number  ) {

//         if (gstSet.has(normalizedRow.gst_number )) {

//           rowErrors.push( "Duplicate gst_number in excel" );

//         } else {

//           gstSet.add( normalizedRow.gst_number);

//         }

//       }

//       /**
//        * DUPLICATE PAN INSIDE EXCEL
//        */

//       if (normalizedRow.pan_number ) {

//         if (panSet.has(normalizedRow.pan_number  )) {

//           rowErrors.push( "Duplicate pan_number in excel" );
              
//         } else {

//           panSet.add(  normalizedRow.pan_number  );

//         }

//       }

//       /**
//        * DB EMAIL CHECK
//        */

//       const existingUser = await this.repository.checkUserEmail(
//           connection,
//           normalizedRow.userEmail
//         );

//       if (existingUser) {

//         rowErrors.push(   "Email already exists" );

//       }

//       /**
//        * DB GST CHECK
//        */

//       const existingGST = await this.repository.checkDistributorGST(
//           connection,
//           normalizedRow.gst_number
//         );

//       if (existingGST) {

//         rowErrors.push( "GST already exists");

//       }

//       /**
//        * DB PAN CHECK
//        */

//       const existingPAN =await this.repository.checkDistributorPAN(
//           connection,
//           normalizedRow.pan_number
//         );

//       if (existingPAN) {

//         rowErrors.push(  "PAN already exists" );

//       }

//       /**
//        * PUSH VALIDATION FAILURES
//        */

//       if ( rowErrors.length > 0  ) {

//         validationFailures.push({

//           row: index + 1,

//           email:normalizedRow.userEmail || null,

//           reason: rowErrors

//         });

//       }

//     }

//     /**
//      * STOP ENTIRE FILE
//      */

//     if ( validationFailures.length > 0  ) {

//       return {

//         success: false,

//         message:   "Excel validation failed",

//         total: rows.length,

//         failed_count: validationFailures.length,

//         failures: validationFailures

//       };

//     }

 

//     await connection.beginTransaction();

//     const results = [];

//     for (let index = 0;index < normalizedRows.length; index++ ) {

//       const normalizedRow =normalizedRows[index];

//       /**
//        * PASSWORD
//        */

//       const password = `${normalizedRow.first_name}@321`;

//       const hashedPassword = await bcrypt.hash(  password,10 );

//       /**
//        * PAYLOAD
//        */

//       const payload = {

//         business_name: normalizedRow.business_name,

//         owner_name: normalizedRow.owner_name,

//         gst_number: normalizedRow.gst_number,

//         pan_number: normalizedRow.pan_number,

//         email: normalizedRow.company_email,

//         mobile:normalizedRow.company_mobile,

//         address:normalizedRow.company_address,

//         state_name:normalizedRow.state_name,

//         city_name:normalizedRow.city_name,

//         pincode:normalizedRow.pincode,

//         role_name:"Distributor",

//         permission_ids: [1, 2, 3],

//         admin_user: {

//           first_name: normalizedRow.first_name,

//           last_name:normalizedRow.last_name,

//           email:normalizedRow.userEmail,

//           mobile:normalizedRow.userMobile,

//           password

//         }

//       };

//       /**
//        * CREATE DISTRIBUTOR
//        */

//       const distributorId = await this.repository.createDistributor(
//           connection,
//           payload,
//           currentUser.manufacturerId,
//           currentUser.distributorId
//         );

//       /**
//        * UPDATE DISTRIBUTOR CODE
//        */

//       const distributorCode = await this.repository.updateDistributorCode(
//           connection,
//           distributorId
//         );

//       /**
//        * CREATE ROLE
//        */

//       const roleId =await this.repository.createRole(
//           connection,
//           currentUser.manufacturerId,
//           payload.role_name
//         );

//       /**
//        * MAP ROLE PERMISSIONS
//        */

//       await this.repository.mapRolePermissions(
//         connection,
//         roleId,
//         payload.permission_ids
//       );

//       /**
//        * CREATE USER
//        */

//       const userId = await this.repository.createUser(
//           connection,
//           {
//             manufacturer_id:currentUser.manufacturerId,

//             distributor_id: distributorId,

//             reporting_to_user_id:currentUser.userId,

//             user_type: "DISTRIBUTOR",

//             first_name:payload.admin_user.first_name,

//             last_name:payload.admin_user.last_name,

//             email: payload.admin_user.email,

//             mobile: payload.admin_user.mobile,

//             password_hash:hashedPassword
//           }
//         );

//       /**
//        * ASSIGN ROLE
//        */

//       await this.repository.assignRoleToUser(
//         connection,
//         userId,
//         roleId
//       );

//       /**
//        * CREATE API KEY
//        */

//       const apiKey =await this.repository.createApiKey(
//           connection,
//           currentUser.manufacturerId,
//           distributorId,
//           userId,
//           payload.role_name
//         );

//       /**
//        * SUCCESS
//        */

//       results.push({

//         row: index + 1,

//         distributor_id: distributorId,

//         distributor_code:distributorCode,

//         user_id: userId,

//         api_key:apiKey

//       });

//     }

//     /**
//      * COMMIT ENTIRE IMPORT
//      */

//     await connection.commit();

//     /**
//      * SUCCESS RESPONSE
//      */

//     return {

//       success: true,

//       message: "Bulk onboarding completed successfully",

//       total: rows.length,

//       success_count: results.length,

//       failed_count:  0,

//       failures: [],

//       results

//     };

//   } catch (error) {

//     /**
//      * ROLLBACK ENTIRE IMPORT
//      */

//     if (connection) {

//       await connection.rollback();

//     }

//     throw error;

//   } finally {

//     /**
//      * RELEASE CONNECTION
//      */

//     if (connection) {

//       connection.release();

//     }

//     /**
//      * DELETE FILE
//      */

//     if (filePath && fs.existsSync(filePath) ) {

//       fs.unlink( filePath,(err) => {

//           if (err) {
//             console.log("File delete failed:",err.message  );
//           }

//         }
//       );

//     }

//   }

// }

// async bulkOnboardDistributors(filePath, currentUser) {

//   try {

//     /**
//      * READ EXCEL
//      *
//     const workbook = XLSX.readFile(filePath);

//     const sheetName = workbook.SheetNames[0];

//     const rows = XLSX.utils.sheet_to_json(
//       workbook.Sheets[sheetName]
//     );

//     /**
//      * EMPTY FILE CHECK
//      */

//     if (!rows.length) {

//       return {
//         success: false,
//         message: "Excel file is empty",
//         failures: [
//           {
//             type: "EMPTY_FILE",
//             reason: "Uploaded excel has no records"
//           }
//         ]
//       };

//     }

//     /**
//      * REQUIRED COLUMNS
//      */

//     const requiredColumns = [

//       "business_name",
//       "owner_name",
//       "gst_number",
//       "pan_number",
//       "company_email",
//       "company_mobile",
//       "company_address",
//       "state_name",
//       "city_name",
//       "pincode",
//       "first_name",
//       "last_name",
//       "userEmail",
//       "userMobile"

//     ];

//     /**
//      * VALIDATE REQUIRED COLUMNS
//      */

//     const firstRowKeys = Object.keys(rows[0]);

//     const missingColumns = [];

//     for (const column of requiredColumns) {

//       if (!firstRowKeys.includes(column)) {

//         missingColumns.push({
//           type: "COLUMN_MISSING",
//           column,
//           reason: `Missing required column: ${column}`
//         });

//       }

//     }

//     /**
//      * STOP IF COLUMNS MISSING
//      */

//     if (missingColumns.length) {

//       return {
//         success: false,
//         message: "Excel validation failed",
//         failures: missingColumns
//       };

//     }

//     /**
//      * CHECK DUPLICATE EMAIL INSIDE EXCEL
//      */

//     const emailSet = new Set();

//     const duplicateErrors = [];

//     for (let index = 0; index < rows.length; index++) {

//       const row = rows[index];

//       const email = String(
//         row.userEmail || ""
//       ).trim();

//       if (emailSet.has(email)) {

//         duplicateErrors.push({
//           row: index + 1,
//           email,
//           reason: "Duplicate email found inside excel"
//         });

//       }

//       emailSet.add(email);

//     }

//     /**
//      * STOP IF DUPLICATES FOUND
//      */

//     if (duplicateErrors.length) {

//       return {
//         success: false,
//         message: "Excel validation failed",
//         failures: duplicateErrors
//       };

//     }

//     /**
//      * RESULTS
//      */

//     const results = [];

//     const failures = [];

//     const skipped = [];

//     /**
//      * PROCESS ROWS
//      */

//     for (let index = 0; index < rows.length; index++) {

//       const row = rows[index];

//       /**
//        * NORMALIZE ROW
//        */

//       const normalizedRow = {

//         business_name: String(row.business_name || "").trim(),

//         owner_name: String(row.owner_name || "").trim(),

//         gst_number: String(row.gst_number || "").trim(),

//         pan_number: String(row.pan_number || "").trim(),

//         company_email: String(row.company_email || "").trim(),

//         company_mobile: String(row.company_mobile || "").trim(),

//         company_address: String(row.company_address || "").trim(),

//         state_name: String(row.state_name || "").trim(),

//         city_name: String(row.city_name || "").trim(),

//         pincode: String(row.pincode || "").trim(),

//         first_name: String(row.first_name || "").trim(),

//         last_name: String(row.last_name || "").trim(),

//         userEmail: String(row.userEmail || "").trim(),

//         userMobile: String(row.userMobile || "").trim()

//       };

//       /**
//        * ROW VALIDATION
//        */

//       const rowErrors = [];

//       for (const [key, value] of Object.entries(normalizedRow)) {

//         if (!value) {

//           rowErrors.push(`${key} is required`);

//         }

//       }

//       /**
//        * IF ROW INVALID
//        */

//       if (rowErrors.length) {

//         failures.push({

//           row: index + 1,

//           email: normalizedRow.userEmail || null,

//           reason: rowErrors

//         });

//         continue;

//       }

//       /**
//        * DB CONNECTION
//        */

//       const connection = await db.getConnection();

//       try {

//         /**
//          * BEGIN TRANSACTION
//          */

//         await connection.beginTransaction();

//         /**
//          * CHECK EMAIL EXISTS
//          */

//         const existingUser =
//           await this.repository.checkUserEmail(
//             connection,
//             normalizedRow.userEmail
//           );

//         /**
//          * CHECK GST EXISTS
//          */

//         const existingGST =
//           await this.repository.checkDistributorGST(
//             connection,
//             normalizedRow.gst_number
//           );

//         /**
//          * CHECK PAN EXISTS
//          */

//         const existingPAN =
//           await this.repository.checkDistributorPAN(
//             connection,
//             normalizedRow.pan_number
//           );

//         /**
//          * SKIP ALREADY PROCESSED ROWS
//          */

//         if (
//           existingUser ||
//           existingGST ||
//           existingPAN
//         ) {

//           skipped.push({

//             row: index + 1,

//             email: normalizedRow.userEmail,

//             reason: "Already onboarded"

//           });

//           await connection.rollback();

//           connection.release();

//           continue;

//         }

//         /**
//          * PASSWORD
//          */

//         const password =
//           `${normalizedRow.first_name}@321`;

//         const hashedPassword =
//           await bcrypt.hash(password, 10);

//         /**
//          * PAYLOAD
//          */

//         const payload = {

//           business_name:
//             normalizedRow.business_name,

//           owner_name:
//             normalizedRow.owner_name,

//           gst_number:
//             normalizedRow.gst_number,

//           pan_number:
//             normalizedRow.pan_number,

//           email:
//             normalizedRow.company_email,

//           mobile:
//             normalizedRow.company_mobile,

//           address:
//             normalizedRow.company_address,

//           state_name:
//             normalizedRow.state_name,

//           city_name:
//             normalizedRow.city_name,

//           pincode:
//             normalizedRow.pincode,

//           role_name: "Distributor",

//           permission_ids: [1, 2, 3],

//           admin_user: {

//             first_name:
//               normalizedRow.first_name,

//             last_name:
//               normalizedRow.last_name,

//             email:
//               normalizedRow.userEmail,

//             mobile:
//               normalizedRow.userMobile,

//             password

//           }

//         };

//         /**
//          * CREATE DISTRIBUTOR
//          */

//         const distributorId =
//           await this.repository.createDistributor(
//             connection,
//             payload,
//             currentUser.manufacturerId,
//             currentUser.distributorId
//           );

//         /**
//          * UPDATE DISTRIBUTOR CODE
//          */

//         const distributorCode =
//           await this.repository.updateDistributorCode(
//             connection,
//             distributorId
//           );

//         /**
//          * CREATE ROLE
//          * (UNCHANGED)
//          */

//         const roleId =
//           await this.repository.createRole(
//             connection,
//             currentUser.manufacturerId,
//             payload.role_name
//           );

//         /**
//          * MAP ROLE PERMISSIONS
//          * (UNCHANGED)
//          */

//         await this.repository.mapRolePermissions(
//           connection,
//           roleId,
//           payload.permission_ids
//         );

//         /**
//          * CREATE USER
//          */

//         const userId =
//           await this.repository.createUser(
//             connection,
//             {
//               manufacturer_id:
//                 currentUser.manufacturerId,

//               distributor_id:
//                 distributorId,

//               reporting_to_user_id:
//                 currentUser.userId,

//               user_type: "DISTRIBUTOR",

//               first_name:
//                 payload.admin_user.first_name,

//               last_name:
//                 payload.admin_user.last_name,

//               email:
//                 payload.admin_user.email,

//               mobile:
//                 payload.admin_user.mobile,

//               password_hash:
//                 hashedPassword
//             }
//           );

//         /**
//          * ASSIGN ROLE
//          */

//         await this.repository.assignRoleToUser(
//           connection,
//           userId,
//           roleId
//         );

//         /**
//          * CREATE API KEY
//          */

//         const apiKey =
//           await this.repository.createApiKey(
//             connection,
//             currentUser.manufacturerId,
//             distributorId,
//             userId,
//             payload.role_name
//           );

//         /**
//          * COMMIT
//          */

//         await connection.commit();

//         /**
//          * SUCCESS
//          */

//         results.push({

//           row: index + 1,

//           distributor_id: distributorId,

//           distributor_code: distributorCode,

//           user_id: userId,

//           api_key: apiKey

//         });

//       } catch (error) {

//         /**
//          * ROLLBACK ONLY CURRENT ROW
//          */

//         await connection.rollback();

//         failures.push({

//           row: index + 1,

//           email: normalizedRow.userEmail,

//           reason: error.message

//         });

//       } finally {

//         connection.release();

//       }

//     }

//     /**
//      * FINAL RESPONSE
//      */

//     return {

//       success: true,

//       total: rows.length,

//       success_count: results.length,

//       failed_count: failures.length,

//       skipped_count: skipped.length,

//       results,

//       failures,

//       skipped

//     };

//   } catch (error) {

//     /**
//      * UNEXPECTED SERVER ERROR ONLY
//      */

//     return {

//       success: false,

//       message: "Internal server error",

//       error: error.message

//     };

//   } finally {

//     /**
//      * DELETE FILE
//      */
//     if (
//       filePath &&
//       fs.existsSync(filePath)
//     ) {

//       fs.unlink(filePath, (err) => {

//         if (err) {

//           console.log(
//             "File delete failed:",
//             err.message
//           );

//         }

//       });

//     }

//   }

// }

//****************************  DISTRIBUTOR ******************************************* */
//   async bulkOnboard(req, res, next) {

//   try {

//     if (!req.file) {
//       throw new Error("Excel file required");
//     }

//     const result =
//       await service.bulkOnboardDistributors(
//         req.file.path,
//         req.auth
//       );

//     return res.status(201).json(result);

//   } catch (error) {
//     next(error);
//   }

// }

//***************************Sale-Order******************************************* */
// const parseQty = (str) => {
//   if (!str) return { qty: 0, unit: null };
//   const [q, u] = str.trim().split(/\s+/);
//   return { qty: parseFloat(q) || 0, unit: u || null };
// };

// const parseRate = (str) => {
//   if (!str) return 0;
//   return parseFloat(str.split('/')[0]) || 0;
// };

// const normalizeName = (name) => name?.trim().toUpperCase();

// const formatDate = (d) =>
// `${d.substring(0, 4)}-${d.substring(4, 6)}-${d.substring(6, 8)}`;

// const chunkArray = (arr, size = 500) => {
//   const chunks = [];
//   for (let i = 0; i < arr.length; i += size) {
//     chunks.push(arr.slice(i, i + size));
//   }
//   return chunks;
// };

// const processAddress = (arr, type, invoiceUUID, addressRows) => {
//   if (!Array.isArray(arr)) return;

//   let lineNumber = 1;

//   for (let i = 1; i < arr.length; i++) {
//     const line = arr[i];
//     if (!line) continue;

//     addressRows.push([
//       invoiceUUID,
//       type,
//       lineNumber++,
//       line.trim()
//     ]);
//   }
// };

// function normalizeVoucher(v) {
//   const nv = { ...v };

//   nv.ledgerentries = nv.ledgerentries || [];

//   if (nv.allledgerentries) {
//     nv.ledgerentries = nv.allledgerentries;
//   }

//   nv.allinventoryentries = nv.allinventoryentries || [];

//   if (nv.allledgerentries) {
//     nv.ledgerentries = nv.allledgerentries.map(l => {
//       const copy = { ...l };

//       if (l.inventoryallocations) {
//         nv.allinventoryentries.push(
//           ...l.inventoryallocations.map(inv => ({
//             ...inv,
//             ledgername: l.ledgername
//           }))
//         );
//       }

//       return copy;
//     });
//   }

//   return nv;
// }

// export const bulkUpsertStockItems = async (conn, map) => {
//   const rows = Array.from(map.values());
//   if (!rows.length) return new Map();
//   await conn.query(
//     `INSERT INTO stock_items
//     (manufacturer_id, distributor_id,name,stock_group,category, hsn_code, base_unit, gst_taxability, gst_rate, is_from_invoice, is_synced)
//     VALUES ?
//     ON DUPLICATE KEY UPDATE
//       hsn_code = CASE 
//         WHEN is_synced = FALSE THEN VALUES(hsn_code) 
//         ELSE hsn_code 
//       END,
//       base_unit = CASE 
//         WHEN is_synced = FALSE THEN VALUES(base_unit) 
//         ELSE base_unit 
//       END,
//       gst_taxability = CASE 
//         WHEN is_synced = FALSE THEN VALUES(gst_taxability) 
//         ELSE gst_taxability 
//       END,
//       gst_rate = CASE 
//         WHEN is_synced = FALSE THEN VALUES(gst_rate) 
//         ELSE gst_rate 
//       END`,
//     [
//       rows.map(i => [
//         i.mid,
//         i.did,
//         i.name,
//         i.stk_group,
//         i.category,
//         i.hsn || null,
//         i.unit || null,
//         i.taxability || 'Taxable',
//         i.taxRate || 0,
//         true,   // from invoice
//         false   // not synced
//       ])
//     ]
//   );

//   const [dbRows] = await conn.query(
//     `SELECT id, name FROM stock_items WHERE name IN (?)`,
//     [rows.map(i => i.name)]
//   );

//   return new Map(dbRows.map(r => [normalize(r.name), r.id]));
// };


    // const newFlatSql = `
    // SELECT 
    //   i.uuid AS invoice_id,
    //   i.voucher_number,
    //   i.invoice_date,
    //   i.party_name,
    //   i.total_amount,
    //   i.place_of_supply,
    //   i.state_name,
    //   i.cmpstate,
    //   i.consigneestate,

    //   itm.stock_item_name,
    //   itm.product_code,
    //   itm.hsn_code,
    //   itm.quantity AS quantity,
    //   itm.unit,
    //   itm.rate AS rate,
    //   itm.inclvatrate,
    //   itm.discount,
    //   itm.amount AS amount,
    //   itm.gst_rate AS gstRate,

    //   ROUND(
    //     (itm.amount * (itm.gst_rate / 100)),
    //     2
    //   ) AS gstAmount,

    //   buyer.name AS buyer_name,
    //   buyer.gstin AS buyer_gstin,

    //   consignee.name AS consignee_name,

    //   GROUP_CONCAT(DISTINCT le.ledger_name) AS ledgers,

    //   SUM(le.amount) AS total_ledger_amount,

    //   GROUP_CONCAT(DISTINCT gst.tax_type) AS gst_types

    // FROM sales i

    // LEFT JOIN sales_items itm
    //   ON i.id = itm.sales_id

    // LEFT JOIN sales_parties buyer
    //   ON i.id = buyer.sales_id
    //   AND buyer.party_type = 'BUYER'

    // LEFT JOIN sales_parties consignee
    //   ON i.id = consignee.sales_id
    //   AND consignee.party_type = 'CONSIGNEE'

    // LEFT JOIN sales_ledger_entries le
    //   ON i.id = le.sales_id

    // LEFT JOIN sales_gst_details gst
    //   ON i.id = gst.sales_id

    // ${whereClause}

    // GROUP BY
    //   i.uuid,
    //   itm.stock_item_name,
    //   itm.hsn_code,
    //   itm.unit,
    //   buyer.name,
    //   consignee.name

    // ORDER BY i.invoice_date DESC
    // `;
// export const getdashboardData = async (scope) => {

//   const {
//     manufacturerId,
//     distributorId,
//     userType,
//     accessibleDistributorIds = []
//   } = scope;

//   let conn;

//   try {

//     // =========================
//     // GET CONNECTION
//     // =========================
//     conn = await db.getConnection();

//     // Prevent stale pooled connection issue
//     await conn.ping();

//     const inv_dates = [];

//     let whereClause = '';
//     let params = [];

//     let stockWhereClause = '';
//     let stockParams = [];

//     let purchaseWhereClause = '';
//     let purchaseParams = [];

//     // =========================
//     // MANUFACTURER LOGIN
//     // =========================
//     if (userType === 'MANUFACTURER') {

//       whereClause = `
//         WHERE i.manufacturer_id = ?
//         AND i.voucher_type = 'Sales'
//       `;

//       params = [manufacturerId];

//       stockWhereClause = `
//         WHERE si.manufacturer_id = ?
//       `;

//       stockParams = [manufacturerId];

//       purchaseWhereClause = `
//         WHERE i.manufacturer_id = ?
//         AND i.voucher_type = 'Purchase'
//       `;

//       purchaseParams = [manufacturerId];
//     }

//     // =========================
//     // DISTRIBUTOR LOGIN
//     // =========================
//     else if (userType === 'DISTRIBUTOR') {

//       whereClause = `
//         WHERE i.manufacturer_id = ?
//         AND i.distributor_id = ?
//         AND i.voucher_type = 'Sales'
//       `;

//       params = [manufacturerId, distributorId];

//       stockWhereClause = `
//         WHERE si.manufacturer_id = ?
//         AND si.distributor_id = ?
//       `;

//       stockParams = [manufacturerId, distributorId];

//       purchaseWhereClause = `
//         WHERE i.manufacturer_id = ?
//         AND i.distributor_id = ?
//         AND i.voucher_type = 'Purchase'
//       `;

//       purchaseParams = [manufacturerId, distributorId];
//     }

//     // =========================
//     // INVALID USER TYPE
//     // =========================
//     else {

//       return {
//         totalSalesOvertime: [],
//         total_salesSize: 0,
//         total_sales_amount: 0,
//         total_stocks_sold: 0,
//         openingStocks: 0,
//         purchseStocks: 0,
//         closingStock: 0,
//         total_distributers: 0,
//         invoiceDates: [],
//         items: []
//       };
//     }

//     // =========================
//     // INVOICE DATES
//     // =========================
//     const [dates] = await conn.execute(
//       `
//       SELECT invoice_date
//       FROM sales i
//       ${whereClause}
//       `,
//       params
//     );

//     dates.forEach((d) => {
//       if (d.invoice_date) {
//         inv_dates.push(
//           new Date(d.invoice_date)
//             .toLocaleDateString("en-CA")
//         );
//       }
//     });

//     // =========================
//     // ITEMS DATA
//     // =========================
//     const [items] = await conn.execute(
//       `
//       SELECT
//         i.uuid AS id,
//         i.voucher_number,
//         i.voucher_type,
//         i.party_name,
//         i.place_of_supply,
//         i.state_name,
//         i.invoice_date,

//         itm.stock_item_name,
//         itm.hsn_code,
//         itm.quantity,
//         itm.rate,
//         itm.discount,
//         itm.amount,
//         itm.billedqty

//       FROM sales i

//       JOIN sales_items itm
//         ON i.id = itm.sales_id

//       ${whereClause}
//       `,
//       params
//     );

//     // =========================
//     // TOTAL STOCK SOLD
//     // =========================
//     const [[stockSold]] = await conn.execute(
//       `
//       SELECT
//         ROUND(SUM(itm.quantity), 2) AS stocksold

//       FROM sales_items itm

//       JOIN sales i
//         ON i.id = itm.sales_id

//       ${whereClause}
//       `,
//       params
//     );

//     // =========================
//     // TOTAL DISTRIBUTORS
//     // =========================
//     let distributorWhereClause = '';
//     let distributorParams = [];

//     if (userType === 'MANUFACTURER') {

//       distributorWhereClause = `
//         WHERE l.manufacturer_id = ?
//         AND le.is_party_ledger = true
//       `;

//       distributorParams = [manufacturerId];
//     }

//     else if (userType === 'DISTRIBUTOR') {

//       distributorWhereClause = `
//         WHERE l.manufacturer_id = ?
//         AND l.distributor_id = ?
//         AND le.is_party_ledger = true
//       `;

//       distributorParams = [
//         manufacturerId,
//         distributorId
//       ];
//     }

//     const [[totl_dist]] = await conn.execute(
//       `
//       SELECT
//         COUNT(DISTINCT l.id) AS distributors

//       FROM ledgers l

//       JOIN sales_ledger_entries le
//         ON le.ledger_id = l.id

//       ${distributorWhereClause}
//       `,
//       distributorParams
//     );

//     // =========================
//     // OPENING STOCK
//     // =========================
//     const [[openingstock]] = await conn.execute(
//       `
//       SELECT
//         ROUND(SUM(sb.qty), 2) AS openingStock

//       FROM stock_batches sb

//       JOIN stock_items si
//         ON si.id = sb.stock_item_id

//       ${stockWhereClause}
//       `,
//       stockParams
//     );

//     // =========================
//     // PURCHASE STOCK
//     // =========================
//     const [[purchaseStock]] = await conn.execute(
//       `
//       SELECT
//         ROUND(SUM(itm.quantity), 2) AS purchaseStock

//       FROM purchase_items itm

//       JOIN vouchers i
//         ON i.id = itm.voucher_id

//       ${purchaseWhereClause}
//       `,
//       purchaseParams
//     );

//     // =========================
//     // STOCK CALCULATIONS
//     // =========================
//     const os = Number(openingstock?.openingStock || 0);

//     const ps = Number(purchaseStock?.purchaseStock || 0);

//     const ss = Number(stockSold?.stocksold || 0);

//     const closingStock = os + ps - ss;

//     // =========================
//     // SALES SUMMARY
//     // =========================
//     const [[summary]] = await conn.execute(
//       `
//       SELECT
//         COUNT(*) AS total_sales,
//         ROUND(SUM(total_amount), 2) AS total_sales_amount

//       FROM sales i

//       ${whereClause}
//       `,
//       params
//     );

//     // =========================
//     // SALES OVER TIME
//     // =========================
//     const [rows] = await conn.execute(
//       `
//       SELECT
//         invoice_date,
//         total_amount

//       FROM sales i

//       ${whereClause}

//       ORDER BY invoice_date ASC
//       `,
//       params
//     );

//     const result = rows.map((r) => ({
//       date: r.invoice_date
//         ? new Date(r.invoice_date)
//             .toLocaleDateString("en-CA")
//         : null,

//       amount: Number(r.total_amount || 0)
//     }));

//     // =========================
//     // FINAL RESPONSE
//     // =========================
//     return {

//       totalSalesOvertime: result,

//       total_salesSize:
//         Number(summary?.total_sales || 0),

//       total_sales_amount:
//         Number(summary?.total_sales_amount || 0),

//       total_stocks_sold: ss,

//       openingStocks: os,

//       purchseStocks: ps,

//       closingStock,

//       total_distributers:
//         Number(totl_dist?.distributors || 0),

//       invoiceDates: inv_dates,

//       items: items || []
//     };

//   } catch (e) {

//     console.error("Get Dashboard Error:", {
//       message: e.message,
//       code: e.code,
//       errno: e.errno,
//       sqlMessage: e.sqlMessage,
//       sqlState: e.sqlState,
//       sql: e.sql
//     });

//     throw new Error(
//       `Dashboard fetch failed: ${e.message}`
//     );

//   } finally {

//     if (conn) {
//       conn.release();
//     }
//   }
// };
// git fetch origin
// git restore --source origin/main --staged --worktree dms_backend\


// //CREATE INDEX idx_sales_report
// ON sales (
//     manufacturer_id,
//     voucher_type,
//     invoice_date,
//     id
// );
// no costing method ,
// CREATE INDEX idx_sales_items_sales_id
// ON sales_items (sales_id);

// CREATE INDEX idx_sales_parties_sales_type
// ON sales_parties (sales_id, party_type);

// CREATE INDEX idx_gst_sales_tax
// ON sales_gst_details (sales_id, tax_type);

// CREATE INDEX idx_sle_sales_ledger
// ON sales_ledger_entries (sales_id, ledger_id);

// CREATE INDEX idx_sle_sales
// ON sales_ledger_entries (sales_id);

// CREATE INDEX idx_ledgers_type
// ON ledgers (ledger_type, id);

//************************************AUTH****************************************** */
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// import authRepository from "./auth.repository.js";
// import { env } from "../../config/env.js";

// class AuthService {
//   async login(payload, meta) {
//     const { email, password } = payload;

//     const user = await authRepository.findUserByEmail(email);

//     if (!user) {
//       throw new Error("Invalid credentials");
//     }

//     if (user.status !== "ACTIVE") {
//       throw new Error("User inactive");
//     }

//     const isPasswordValid = await bcrypt.compare(
//       password,
//       user.password_hash
//     );

//     if (!isPasswordValid) {
//       throw new Error("Invalid credentials");
//     }

//     // ACCESS TOKEN
//     const accessToken = jwt.sign(
//       {
//         userId: user.id,
//         manufacturerId: user.manufacturer_id,
//         distributorId: user.distributor_id,
//         userType: user.user_type,
//       },
//       env.accessSecret,
//       {
//         expiresIn: env.accessExpires,
//       }
//     );

//     // REFRESH TOKEN
//     const refreshToken = jwt.sign(
//       {
//         userId: user.id,
//       },
//       env.refreshSecret,
//       {
//         expiresIn: env.refreshExpires,
//       }
//     );

//     // STORE SESSION
//     const expiresAt = new Date();
//     expiresAt.setDate(expiresAt.getDate() + 7);

//     await authRepository.createSession({
//       userId: user.id,
//       refreshToken,
//       ipAddress: meta.ipAddress,
//       userAgent: meta.userAgent,
//       expiresAt,
//     });

//     return {
//       accessToken,
//       refreshToken,

//       user: {
//         id: user.id,
//         manufacturerId: user.manufacturer_id,
//         distributorId: user.distributor_id,
//         userType: user.user_type,
//         email: user.email,
//       },
//     };
//   }

//   async refreshAccessToken(refreshToken) {
//     if (!refreshToken) {
//       throw new Error("Refresh token missing");
//     }

//     // VERIFY TOKEN
//     const decoded = jwt.verify(
//       refreshToken,
//       env.refreshSecret
//     );

//     // CHECK SESSION
//     const session =
//       await authRepository.findSessionByRefreshToken(
//         refreshToken
//       );

//     if (!session) {
//       throw new Error("Invalid session");
//     }

//     // GET USER
//     const user = await authRepository.findUserById(
//       decoded.userId
//     );
// whether group by will 
//     if (!user) {
//       throw new Error("User not found");
//     }

//     if (user.status !== "ACTIVE") {
//       throw new Error("User inactive");
//     }

//     // ISSUE NEW ACCESS TOKEN
//     const newAccessToken = jwt.sign(
//       {
//         userId: user.id,
//         manufacturerId: user.manufacturer_id,
//         distributorId: user.distributor_id,
//         userType: user.user_type,
//       },
//       env.accessSecret,
//       {
//         expiresIn: env.accessExpires,
//       }
//     );

//     return {
//       accessToken: newAccessToken,
//     };
//   }
//   async logout(refreshToken) {

//     if (!refreshToken) {
//       throw new Error("Refresh token missing");
//     }

//     // verify token
//     try {
//       jwt.verify(refreshToken, env.refreshSecret);
//     } catch (error) {
//       throw new Error("Invalid refresh token");
//     }

//     // revoke DB session
//     await authRepository.revokeSession(refreshToken);

//     return true;
//   }


// }

// export default new AuthService();
// import authService from "./auth.service.js";

// class AuthController {
//   async login(req, res) {
//     try {
//       const result = await authService.login(req.body, {
//         ipAddress: req.ip,
//         userAgent: req.headers["user-agent"],
//       });

//       // Secure HTTP-only cookie
//       res.cookie("accessToken", result.accessToken, {
//         httpOnly: true,
      
//         secure: process.env.NODE_ENV === "production",

//         sameSite: "lax",

//         maxAge: 15 * 60 * 1000,
//       });

//       return res.status(200).json({
//         success: true,

//         message: "Login successful",

//         data: {
//           user: result.user,
//         },
//       });
//     } catch (error) {
//       return res.status(401).json({
//         success: false,

//         message: error.message,
//       });
//     }
//   }
// }

// export default new AuthController();

// import express from "express";

// import authController from "./auth.controller.js";

// const router = express.Router();

// router.post("/login", (req, res) => {
//   authController.login(req, res);
// });

// router.post("/refresh", authController.refresh);
// router.post("/logout", authController.logout);
// export default router;
// import express from "express";
// import authController from "./auth.controller.js";

// const router = express.Router();

// router.post("/login", authController.login);
// router.post("/refresh", authController.refresh);
// router.post("/logout", authController.logout);

// export default router;

// import { db } from "../../config/database.js";

// class AuthRepository {
//   async findUserByEmail(email) {
//     const query = `
//       SELECT 
//         id,
//         manufacturer_id,
//         distributor_id,
//         user_type,
//         email,
//         password_hash,
//         first_name,
//         last_name,
//         status
//       FROM users
//       WHERE email = ?
//       LIMIT 1
//     `;

//     const [rows] = await db.execute(query, [email]);

//     return rows[0];
//   }

//   async findUserById(userId) {
//     const query = `
//       SELECT 
//         id,
//         manufacturer_id,
//         distributor_id,
//         user_type,
//         email,
//         status
//       FROM users
//       WHERE id = ?
//       LIMIT 1
//     `;

//     const [rows] = await db.execute(query, [userId]);

//     return rows[0];
//   }

//   async createSession(payload) {
//     const query = `
//       INSERT INTO user_sessions (
//         user_id,
//         refresh_token,
//         ip_address,
//         user_agent,
//         expires_at
//       )
//       VALUES (?, ?, ?, ?, ?)
//     `;

//     const values = [
//       payload.userId,
//       payload.refreshToken,
//       payload.ipAddress,
//       payload.userAgent,
//       payload.expiresAt,
//     ];

//     const [result] = await db.execute(query, values);

//     return result.insertId;
//   }

//   async findSessionByRefreshToken(refreshToken) {
//     const query = `
//       SELECT *
//       FROM user_sessions
//       WHERE refresh_token = ?
//       AND is_revoked = FALSE
//       LIMIT 1
//     `;

//     const [rows] = await db.execute(query, [refreshToken]);

//     return rows[0];
//   }
//   async revokeSession(refreshToken) {
//     const query = `
//       UPDATE user_sessions
//       SET is_revoked = TRUE
//       WHERE refresh_token = ?
//     `;

//     await db.execute(query, [refreshToken]);
//   }

// }

// export default new AuthRepository();

// auth.repository.js



//*******************************AUTH REPOSTORY.js**************************************** */
// import {db} from "../../config/database.js";

// // Generic transaction wrapper
// export const transaction = async (callback) => {
//   return await db.transaction(callback);
// };

// export const findManufacturerByEmail = async (email) => {
//   return db("manufacturers").where({ email }).first();
// };

// export const createManufacturer = async (trx, data) => {
//   const [row] = await trx("manufacturers")
//     .insert({
//       manufacturer_code: `MFG-${Date.now()}`,
//       company_name: data.company_name,
//       email: data.email,
//       mobile: data.mobile
//     })
//     .returning("*");

//   return row;
// };

// export const createUser = async (trx, data) => {
//   const [user] = await trx("users")
//     .insert({
//       manufacturer_id: data.manufacturer_id,
//       first_name: data.first_name,
//       last_name: data.last_name,
//       email: data.email,
//       mobile: data.mobile,
//       password_hash: data.password_hash,
//       user_type: data.user_type,
//       is_super_admin: data.is_super_admin
//     })
//     .returning("*");

//   return user;
// };

// export const createDefaultRoles = async (trx, manufacturer_id) => {
//   return trx("roles").insert([
//     {
//       manufacturer_id,
//       role_code: "ADMIN",
//       role_name: "Administrator",
//       is_system_role: true
//     },
//     {
//       manufacturer_id,
//       role_code: "MANAGER",
//       role_name: "Manager",
//       is_system_role: true
//     }
//   ]);
// };

// export const createTallyConnection = async (trx, data) => {
//   return trx("tally_connections").insert({
//     manufacturer_id: data.manufacturer_id,
//     distributor_id: data.distributor_id,
//     tally_company_name: "NOT_CONNECTED",
//     sync_status: "DISCONNECTED"
//   });
// };

// export const createAuditLog = async (trx, data) => {
//   return trx("audit_logs").insert({
//     manufacturer_id: data.manufacturer_id,
//     user_id: data.user_id,
//     module_name: data.module_name,
//     action_name: data.action_name,
//     new_values: data.new_values,
//     created_at: new Date()
//   });
// };
// whether it happens for everyone 
// this flow is good to change password
// 1.user enters email->send otp->verify otp->allow to change password 
// i allready created both api i want to create chnage password api
// i will provide my code you just understand all code structure and my system then provide forget password api
// why my lungs is painign after inhale air just mild pain left side 22
// just 5 minutes ago
// not serious pain just littible bit like irritation
