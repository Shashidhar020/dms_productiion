import { Router } from 'express';
import { createSales, getSalesData, getStockItemsController, getsalesSummaryControl, getLedgersController, getSalesWithPartyDetailsController, getinvoiceController, getDashboarddataControl,getFlatsalesControl } from './sales.controller.js';
import authenticate from '../../shared/middelware/authenticate.middleware.js';
import { validateSessionMiddleware } from '../../shared/middelware/validate-session.middleware.js';
import hierarchyResolverMiddleware from '../../shared/middelware/hierarchyResolver.middleware.js';

const salesRoutes = Router();

salesRoutes.use(authenticate)
salesRoutes.use(validateSessionMiddleware)
salesRoutes.use(hierarchyResolverMiddleware)
salesRoutes.post('/create-vouchers', createSales);
salesRoutes.get('/summary', getSalesData);
salesRoutes.get('/detailed',getFlatsalesControl);
salesRoutes.get('/stock-items', getStockItemsController);
salesRoutes.get('/ledgers', getLedgersController);
salesRoutes.get('/parties', getSalesWithPartyDetailsController);
salesRoutes.get('/report/:uuid', getinvoiceController);
salesRoutes.get('/dashboard-data', getDashboarddataControl);
salesRoutes.get('/salesReport',getsalesSummaryControl)
export { salesRoutes };
