//purchase vouchers'
import { success } from 'zod/v4';
import { createBulkVouchers, getVouchersServiceData, getStockItemsService, getLedgersService, getVouchersWithPartyDetailsservice, getdetailedvoucherService, getDashboardDataservice, getFlatVouchersReportservice,getPoDataService } from './purchase.services.js';

// BULK SALES CONTROLLER
export const createVouchers = async (req, res) => {
  try {
    const payload = req.body;
  
    const auth = req.auth

    if (!payload || !payload['purchase']) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload'
      });
    }

    const result = await createBulkVouchers(payload, auth || {});
    console.log("Purchase", new Date().toLocaleString())
    return res.status(201).json(result);

  } catch (error) {
    console.error('Purchase Insert Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};


const getVouchersData = async (req, res) => {
  try {
    const result = await getVouchersServiceData(req.scope)
    res.status(200).json(result)
  }
  catch (e) {
    res.status(500).json({
      error: e
    })
  }
}

export const getStockItemsController = async (req, res) => {
  try {
    const result = await getStockItemsService();

    return res.status(200).json({
      success: true,
      message: 'Stock items fetched successfully',
      ...result
    });

  } catch (error) {
    console.error('GET STOCK ITEMS ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch stock items',
      error: error.message
    });
  }
};


export const getLedgersController = async (req, res) => {
  try {
    const result = await getLedgersService();
    return res.status(200).json({
      success: true,
      message: 'Ledgers fetched successfully',
      ...result
    });

  } catch (error) {
    console.error('GET LEDGERS ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch ledgers',
      error: error.message
    });
  }
};

const getVouchersWithPartyDetailsController = async (req, res) => {
  try {
    const result = await getVouchersWithPartyDetailsservice(req.scope);
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

const getdetailedVoucherController = async (req, res) => {
  try {
    const result = await getdetailedvoucherService(req.params.uuid);

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

const getDashboarddataControl = async (req, res) => {
  try {
    const result = await getDashboardDataservice()
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
const getFlatsVouchersControl = async (req, res) => {
  try {
    const result = await getFlatVouchersReportservice(req.scope)
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
const getPoDataContorl = async (req, res) => {
  try {
    const result = await getPoDataService(req.scope)
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


export { getVouchersData, getVouchersWithPartyDetailsController, getdetailedVoucherController, getDashboarddataControl, getFlatsVouchersControl,getPoDataContorl }