import { Router } from 'express';
import {createVouchers,getFlatPurchaseOrders,getDetailedPO,getPOPartyDetails,getPOSummary,getPoData} from './purchase-order.controller.js';
import authenticate from '../../shared/middelware/authenticate.middleware.js';
import { validateSessionMiddleware } from '../../shared/middelware/validate-session.middleware.js';
import hierarchyResolverMiddleware from '../../shared/middelware/hierarchyResolver.middleware.js';

const purchaseOrderRoutes = Router();

purchaseOrderRoutes.use(authenticate)
purchaseOrderRoutes.use(validateSessionMiddleware)
purchaseOrderRoutes.use(hierarchyResolverMiddleware)
purchaseOrderRoutes.post('/create-voucher', createVouchers);
purchaseOrderRoutes.get('/summary', getPOSummary);
purchaseOrderRoutes.get('/parties', getPOPartyDetails);
purchaseOrderRoutes.get('/report/:uuid', getDetailedPO);
purchaseOrderRoutes.get('/detailed',getFlatPurchaseOrders)
purchaseOrderRoutes.get('/poReport',getPoData)
export {purchaseOrderRoutes};
