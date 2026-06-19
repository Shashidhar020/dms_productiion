
function cleanString(val) {
  if (!val) return null;
  return val.replace(/\u0004/g, '').trim();
}

function cleanNumber(val) {
  if (!val) return 0;
  return parseFloat(val.toString().replace(/[^\d.-]/g, '')) || 0;
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return `${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}`;
}

export const parseStockItems = (data) => {
  const items = [];

  for (const item of data["StockItems"] || []) {
    const qty = cleanNumber(item.openingbalance);
    const rate = cleanNumber(item.openingrate);

    items.push({
      guid: item.guid,
      name: item.metadata?.name,
      parent: cleanString(item.parent),
      category: cleanString(item.category),
      base_unit: item.baseunits,

      opening_qty: qty,
      opening_rate: rate,
      opening_value: cleanNumber(item.openingvalue),
      is_batchwise: item.isbatchwiseon || false,

      tax: extractTax(item),
      batches: extractBatches(item),
      prices: extractPrices(item),
      gstList: extractGST(item),
      hsnList: extractHSN(item)
    });
  }

  return items;
};

function extractTax(item) {
  const rates = item.gstdetails?.[0]?.statewisedetails?.[0]?.ratedetails || [];

  let cgst = 0, sgst = 0, igst = 0;

  for (const r of rates) {
    const rate = cleanNumber(r.gstrate);

    if (r.gstratedutyhead === 'CGST') cgst = rate;
    if (r.gstratedutyhead?.includes('SGST')) sgst = rate;
    if (r.gstratedutyhead === 'IGST') igst = rate;
  }

  return {
    cgst,
    sgst,
    igst,
    hsn_code: item.hsndetails?.[0]?.hsncode || null
  };
}

function extractBatches(item) {
  return (item.batchallocations || []).map(b => ({
    godown: cleanString(b.godownname),
    batch_name: cleanString(b.batchname),
    qty: cleanNumber(b.openingbalance),
    rate: cleanNumber(b.openingrate)
  }));
}

function extractPrices(item) {
  const prices = [];

  for (const p of item.fullpricelist || []) {
    for (const d of p.pricelevellist || []) {
      prices.push({
        price_type: cleanString(p.pricelevel),
        min_qty: cleanNumber(d.startingfrom),
        max_qty: cleanNumber(d.endingat),
        rate: cleanNumber(d.rate),
        discount: cleanNumber(d.discount)
      });
    }
  }

  return prices;
}

function extractGST(item) {
  const gstList = [];

  for (const g of item.gstdetails || []) {
    const gst = {
      applicable_from: formatDate(g.applicablefrom),
      taxability: g.taxability,
      source: g.srcofgstdetails,
      is_reverse_charge: g.isreversechargeapplicable || false,
      is_non_gst: g.isnongstgoods || false,
      is_ineligible_itc: g.gstineligibleitc || false,
      rates: []
    };

    for (const state of g.statewisedetails || []) {
      let cgst = 0, sgst = 0, igst = 0, cess = 0;

      for (const r of state.ratedetails || []) {
        const rate = cleanNumber(r.gstrate);

        if (r.gstratedutyhead === 'CGST') cgst = rate;
        if (r.gstratedutyhead?.includes('SGST')) sgst = rate;
        if (r.gstratedutyhead === 'IGST') igst = rate;
        if (r.gstratedutyhead === 'Cess') cess = rate;
      }

      gst.rates.push({
        state_name: cleanString(state.statename),
        cgst,
        sgst,
        igst,
        cess
      });
    }

    if (!gst.rates.length) continue;

    gstList.push(gst);
  }

  return gstList;
}

function extractHSN(item) {
  const hsnList = [];

  for (const h of item.hsndetails || []) {
    hsnList.push({
      applicable_from: formatDate(h.applicablefrom),
      hsn_code: h.hsncode || null,
      source: h.srcofhsndetails
    });
  }

  return hsnList;
}