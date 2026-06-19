
import purchaseOrderServices from "./purchase-order.services.js"
import { createBulkVouchers } from "./purchase-order.services.js";
export const createVouchers = async (req, res) => {
  try {
    const payload = req.body;
    const auth = req.auth
  
    if (!payload || !payload['purchaseorders']) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload'
      });
    }

    const result = await createBulkVouchers(payload, auth || {});
    console.log("Purchase Order", new Date().toLocaleString())
    return res.status(201).json(result);

  } catch (error) {
    console.error('Purchase Insert Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};
const getFlatPurchaseOrders = async (req, res) => {
  try {
    const result = await purchaseOrderServices.getFlatPurchaseOrders(req.scope)
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
const getPoData = async (req, res) => {
  try {
    const result = await purchaseOrderServices.getPoData(req.scope)
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

const getPOSummary = async (req, res) => {
  try {
    const result = await purchaseOrderServices.getPOSummary(req.scope)
    res.status(200).json(result)
  }
  catch (e) {
    res.status(500).json({
      error: e
    })
  }
}

const getPOPartyDetails = async (req, res) => {
  try {
    const result = await purchaseOrderServices.getPOPartyDetails(req.scope);
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

const getDetailedPO = async (req, res) => {
  try {
    const result = await purchaseOrderServices.getFullPOView(req.params.uuid);

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

export { getFlatPurchaseOrders, getDetailedPO, getPOPartyDetails, getPOSummary,getPoData }