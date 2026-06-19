import { Router } from 'express';
import { createSales,getFlatSalesOrders,getFullSOView,getSOPartyDetails,getSOSummary,getSoData} from './sales-order.controller.js';
import authenticate from '../../shared/middelware/authenticate.middleware.js';
import { validateSessionMiddleware } from '../../shared/middelware/validate-session.middleware.js';
import hierarchyResolverMiddleware from '../../shared/middelware/hierarchyResolver.middleware.js';
const salesOrderRoutes = Router();
salesOrderRoutes.use(authenticate)
salesOrderRoutes.use(validateSessionMiddleware)
salesOrderRoutes.use(hierarchyResolverMiddleware)
salesOrderRoutes.post('/create-vouchers', createSales);
salesOrderRoutes.get('/summary', getSOSummary);
salesOrderRoutes.get('/parties', getSOPartyDetails);
salesOrderRoutes.get('/report/:uuid', getFullSOView);
salesOrderRoutes.get('/detailed',getFlatSalesOrders)
salesOrderRoutes.get('/soReport',getSoData)
export { salesOrderRoutes };


