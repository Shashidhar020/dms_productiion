import { Router } from 'express';
import { createVouchers, getVouchersData, getStockItemsController, getLedgersController, getVouchersWithPartyDetailsController, getdetailedVoucherController, getDashboarddataControl,getFlatsVouchersControl,getPoDataContorl } from './purchase.controller.js';
import authenticate from '../../shared/middelware/authenticate.middleware.js';
import { validateSessionMiddleware } from '../../shared/middelware/validate-session.middleware.js';
import hierarchyResolverMiddleware from '../../shared/middelware/hierarchyResolver.middleware.js';

const purchaseRoutes = Router();
purchaseRoutes.use(authenticate)
purchaseRoutes.use(validateSessionMiddleware)
purchaseRoutes.use(hierarchyResolverMiddleware)
purchaseRoutes.post('/create-voucher', createVouchers);
purchaseRoutes.get('/summary', getVouchersData);
purchaseRoutes.get('/detailed',getFlatsVouchersControl);
purchaseRoutes.get('/parties', getVouchersWithPartyDetailsController);
purchaseRoutes.get('/report/:uuid', getdetailedVoucherController);
purchaseRoutes.get('/purchaseReport', getPoDataContorl);
export { purchaseRoutes };
