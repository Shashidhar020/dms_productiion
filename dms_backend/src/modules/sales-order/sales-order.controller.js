//Sales Order vouchers

import { success } from 'zod/v4';
import { createBulkSales } from './sales-order.services.js';
import salesOrderServices from './sales-order.services.js';
export const createSales = async (req, res) => {
  try {
    const payload = req.body;
    const auth = req.auth
    
    if (!payload || !payload['salesorders']) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload'
      });
    }
    const result = await createBulkSales(payload, auth || {});
    
    return res.status(201).json(result);

  } catch (error) {
    console.error('Sales Insert Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};
const getFlatSalesOrders = async (req, res) => {
  try {
    const result = await salesOrderServices.getFlatSOReport(req.scope)
    res.status(200).json(result)
  }
  catch (e) {
    console.log("Get Dashboard error", e)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch Purchase Orders',
      error: e.message
    });
  }
}


const getSOSummary = async (req, res) => {
  try {
    const result = await salesOrderServices.getSOSummary(req.scope)
    res.status(200).json(result)
  }
  catch (e) {
    res.status(500).json({
      error: e
    })
  }
}

const getSOPartyDetails = async (req, res) => {
  try {
    const result = await salesOrderServices.getSOPartyDetails(req.scope);
    // return res.status(200).json(result)
    return res.status(200).json({
      success: true,
      message: 'Vouchers Details Fetched Successfully',
      Vouchers: result
    });

  } catch (error) {
    console.error('GET Purchase ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch Purchases',
      error: error.message
    });
  }
}

const getFullSOView = async (req, res) => {
  try {
    const result = await salesOrderServices.getFullSOView(req.params.uuid);

    if (!result) return res.status(404).json({ success: true, message: 'No Invoice Found' })
    return res.status(200).json({
      success: true,
      message: 'Purchase Details Fetched Successfully',
      ...result
    });
  } catch (error) {
    console.error('GET Purchase ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch Purchase',
      error: error.message
    });
  }
}
const getSoData = async (req, res) => {
  try {
    const result = await salesOrderServices.getSoData(req.scope)
    res.status(200).json(result)
  }
  catch (e) {
    console.log("Get Dashboard error", e)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch Invoice',
      error: e.message
    });
  }
}
export { getFlatSalesOrders, getFullSOView, getSOPartyDetails, getSOSummary,getSoData  }