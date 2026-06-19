import stockServices from './stockItem.services.js'
import { parseStockItems } from '../../utils/parser.js';
import { processStockBulk } from './stockItem.services.js';

const getStockItems = async (req, res) => {
  try {

    const result = await stockServices.getStockItems(req.scope);
    return res.status(200).json({
      success: true,
      message: 'Stock items fetched successfully',
      ...result
    }); 
  } 
  catch (error) {
    console.error('GET STOCK ITEMS ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch stock items',
      error: error.message
    });
  }
}; 
// controllers/stock.controller.js
export const bulkUploadStock = async (req, res) => {
  try {
    const auth = req.auth
   
    const parsed = parseStockItems(req.body);
    const result = await processStockBulk(parsed,auth);
    res.json({
      success: true,
      total: result.total,
      stockNames:result.stockItems
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
export default {getStockItems}