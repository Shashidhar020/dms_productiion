import {
  createCompany,
  findCompanyByCode,
  findCompanyByEmail,
  findCompanyById
} from '../../models/company.model.js';
import {
  createDistributorLink,
  findDistributorLink
} from '../../models/manufacturer-distributor-map.model.js';
import { AppError } from '../../shared/app-error.js';

export async function getCompanyById(companyId) {
  const company = await findCompanyById(companyId);

  if (!company) {
    throw new AppError('Company not found', 404);
  }

  return company;
}

async function validateCompanyUniqueness({ companyCode, email }) {
  const existingCompanyByCode = await findCompanyByCode(companyCode);

  if (existingCompanyByCode) {
    throw new AppError('Company code already exists', 409);
  }

  const existingCompanyByEmail = await findCompanyByEmail(email);

  if (existingCompanyByEmail) {
    throw new AppError('Company email already exists', 409);
  }
}

export async function createManufacturerCompany(payload) {
  await validateCompanyUniqueness(payload);

  return createCompany({
    companyCode: payload.companyCode,
    name: payload.name,
    email: payload.email,
    companyType: 'MANUFACTURER'
  });
}

export async function createDistributorCompany(payload) {
  await validateCompanyUniqueness(payload);

  return createCompany({
    companyCode: payload.companyCode,
    name: payload.name,
    email: payload.email,
    companyType: 'DISTRIBUTOR'
  });
}

export async function mapDistributorToManufacturer({ manufacturerCompanyId, distributorCompanyId }) {
  const manufacturerCompany = await findCompanyById(manufacturerCompanyId);

  if (!manufacturerCompany) {
    throw new AppError('Manufacturer company not found', 404);
  }

  if (manufacturerCompany.company_type !== 'MANUFACTURER') {
    throw new AppError('Selected manufacturer company is not a manufacturer', 400);
  }

  const distributorCompany = await findCompanyById(distributorCompanyId);

  if (!distributorCompany) {
    throw new AppError('Distributor company not found', 404);
  }

  if (distributorCompany.company_type !== 'DISTRIBUTOR') {
    throw new AppError('Selected distributor company is not a distributor', 400);
  }

  if (manufacturerCompany.id === distributorCompany.id) {
    throw new AppError('Manufacturer and distributor cannot be the same company', 400);
  }

  const existingLink = await findDistributorLink(manufacturerCompanyId, distributorCompanyId);

  if (existingLink) {
    throw new AppError('Distributor is already mapped to this manufacturer', 409);
  }

  return createDistributorLink(manufacturerCompanyId, distributorCompanyId);
}



function normalizeVoucher(v) {
  if (v.allinventoryentries && v.ledgerentries) {
    return v;
  }

  const nv = { ...v };
  if (v.allledgerentries) {
    nv.ledgerentries = v.allledgerentries.map(l => {
      const copy = { ...l };

      if (l.inventoryallocations) {
        nv.allinventoryentries = nv.allinventoryentries || [];

        for (const inv of l.inventoryallocations) {
          nv.allinventoryentries.push({
            ...inv,
            accountingallocations: [
              {
                ledgername: l.ledgername,
                amount: inv.amount
              }
            ]
          });
        }
      }

      return copy;
    });
  }

  nv.allinventoryentries = nv.allinventoryentries || [];
  nv.ledgerentries = nv.ledgerentries || [];

  return nv;
}

try {
  await conn.beginTransaction();

  const vouchers = payload.tallymessage || [];

  const invoiceRows = [];
  const partyRows = [];
  const addressRows = [];
  const gstRows = [];
  const itemRows = [];
  const batchRows = [];
  const ledgerRows = [];

  const invoiceMap = new Map();
  const stockMap = new Map();
  const ledgerMap = new Map();

  // ===============================
  // STEP 1: COLLECT UNIQUE DATA
  // ===============================
  for (let v of vouchers) {
    v = normalizeVoucher(v);

    for (const item of v.allinventoryentries || []) {
      if (!stockMap.has(item.stockitemname)) {
        stockMap.set(item.stockitemname, {
          name: item.stockitemname,
          hsn: item.gsthsnname,
          unit: parseQty(item.actualqty).unit,
          taxability: item.gstovrdntaxability || 'Taxable'
        });
      }
    }

    for (const l of v.ledgerentries || []) {
      if (!ledgerMap.has(l.ledgername)) {
        ledgerMap.set(l.ledgername, {
          name: l.ledgername,
          type: l.ispartyledger ? 'CUSTOMER' : 'GENERAL'
        });
      }
    }
  }

  // ===============================
  // STEP 2: BULK UPSERT
  // ===============================
  const stockIdMap = await bulkUpsertStockItems(conn, stockMap);
  const ledgerIdMap = await bulkUpsertLedgers(conn, ledgerMap);

  // ===============================
  // STEP 3: PROCESS DATA
  // ===============================
  for (let v of vouchers) {
    v = normalizeVoucher(v);

    const invoiceUUID = nanoid();
    invoiceMap.set(v.guid, invoiceUUID);

    const total = (v.allinventoryentries || []).reduce(
      (s, i) => s + parseFloat(i.amount || 0),
      0
    );

    invoiceRows.push([
      invoiceUUID,
      v.guid,
      v.vouchernumber,
      v.vouchertypename,
      formatDate(v.date),
      formatDate(v.effectivedate),
      v.partyname,
      v.partyledgername,
      v.partygstin || null,
      v.cmpgstin || null,
      v.placeofsupply,
      v.statename,
      v.narration || null,
      total,
      v.enteredby
    ]);

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

    processAddress(v.basicbuyeraddress, 'BUYER', invoiceUUID, addressRows);
    processAddress(v.address, 'CONSIGNEE', invoiceUUID, addressRows);
    processAddress(v.dispatchfromaddress, 'DISPATCH_FROM', invoiceUUID, addressRows);

    if (!v.address && v.basicbuyeraddress) {
      processAddress(v.basicbuyeraddress, 'CONSIGNEE', invoiceUUID, addressRows);
    }

    if (v.gstregistration) {
      gstRows.push([
        invoiceUUID,
        v.gstregistration.value,
        v.gstregistration.taxtype,
        v.gstregistration.taxregistration,
        v.statename
      ]);
    }

    for (const item of v.allinventoryentries || []) {
      const stockId = stockIdMap.get(item.stockitemname);
      const itemUUID = nanoid();

      const { qty, unit } = parseQty(item.actualqty);

      itemRows.push([
        itemUUID,
        invoiceUUID,
        stockId,
        item.stockitemname,
        item.gsthsnname,
        qty,
        unit,
        parseRate(item.rate),
        parseFloat(item.amount),
        qty
      ]);

      for (const b of item.batchallocations || []) {
        batchRows.push([
          itemUUID,
          b.godownname,
          b.batchname,
          parseQty(b.actualqty).qty,
          parseRate(b.inclvatrate),
          parseFloat(b.amount)
        ]);
      }
    }

    for (const l of v.ledgerentries || []) {
      const ledgerId = ledgerIdMap.get(l.ledgername);

      ledgerRows.push([
        invoiceUUID,
        ledgerId,
        l.ledgername,
        parseFloat(l.amount ?? 0.0),
        l.isdeemedpositive ? 'DEBIT' : 'CREDIT',
        l.ispartyledger
      ]);
    }
  }

  await insertInvoicesBulk(conn, invoiceRows);
  if (partyRows.length) await insertPartiesBulk(conn, partyRows);
  if (addressRows.length) await insertAddressesBulk(conn, addressRows);
  if (gstRows.length) await insertGSTBulk(conn, gstRows);
  if (itemRows.length) await insertItemsBulk(conn, itemRows);
  if (batchRows.length) await insertBatchBulk(conn, batchRows);
  if (ledgerRows.length) await insertLedgerEntriesBulk(conn, ledgerRows);

  await conn.commit();

  return { success: true, count: vouchers.length };

} catch (err) {
  await conn.rollback();
  throw err;
}