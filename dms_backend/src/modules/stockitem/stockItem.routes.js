import { Router } from 'express';
import stockController from './stockItem.controller.js'
import { bulkUploadStock } from './stockItem.controller.js';
import authenticate from '../../shared/middelware/authenticate.middleware.js';
import { validateSessionMiddleware } from '../../shared/middelware/validate-session.middleware.js';
import hierarchyResolverMiddleware from '../../shared/middelware/hierarchyResolver.middleware.js';
const stockRouters = Router();
stockRouters.use(authenticate)
stockRouters.use(validateSessionMiddleware)
stockRouters.use(hierarchyResolverMiddleware)
stockRouters.get('/getCompanyStocks', stockController.getStockItems);
stockRouters.post('/createStocks', bulkUploadStock);
export {stockRouters}
