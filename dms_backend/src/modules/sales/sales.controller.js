//sales vouchers
import { success } from 'zod/v4';
import { createBulkSales, getSalesServiceData, getStockItemsService, getLedgersService, getSalesWithPartyDetailsservice, getinvoiceService, getDashboardDataservice, getFlatSalesReportservice, getSalesSummaryservice } from './sales.service.js';

// BULK SALES CONTROLLER
export const createSales = async (req, res) => {
  try {
    const payload = req.body;
    const auth = req.auth
    console.log(payload)

    if (!payload || !payload['sales']) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload'
      });
    }

    const result = await createBulkSales(payload, auth || {});
    console.log("Sales Data", new Date().toLocaleString())
    return res.status(201).json(result);
  } catch (error) {
    console.error('Sales Insert Error:', error);
    console.log("Sales Data", new Date().toLocaleString())
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};


const getSalesData = async (req, res) => {
  try {
    const result = await getSalesServiceData(req.scope)
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

const getSalesWithPartyDetailsController = async (req, res) => {
  try {
    const result = await getSalesWithPartyDetailsservice(req.scope);
    // return res.status(200).json(result)
    return res.status(200).json({
      success: true,
      message: 'Sales Details Fetched Successfully',
      invoices: result
    });

  } catch (error) {
    console.error('GET Sales ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch Sales',
      error: error.message
    });
  }
}


const getinvoiceController = async (req, res) => {
  try {
    const result = await getinvoiceService(req.params.uuid);

    if (!result) return res.status(404).json({ success: true, message: 'No Invoice Found' })
    return res.status(200).json({
      success: true,
      message: 'Invoces Details Fetched Successfully',
      ...result
    });
  } catch (error) {
    console.error('GET Invoice ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch Invoice',
      error: error.message
    });
  }
}

const getDashboarddataControl = async (req, res) => {
  try {
    const result = await getDashboardDataservice(req.scope)
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
const getFlatsalesControl = async (req, res) => {
  try {
    const result = await getFlatSalesReportservice(req.scope)
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

const getsalesSummaryControl = async (req, res) => {
  try {
    const result = await getSalesSummaryservice(req.scope)
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
export { getSalesData, getSalesWithPartyDetailsController, getinvoiceController, getDashboarddataControl, getFlatsalesControl,getsalesSummaryControl }