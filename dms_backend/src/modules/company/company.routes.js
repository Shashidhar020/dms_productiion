import { Router } from 'express';
import { asyncHandler } from '../../middlewares/async-handler.js';
import { authorize } from '../../middlewares/authorization.js';
import { verifyJwt } from '../auth/auth.middleware.js';
import {
  createDistributor,
  createManufacturer,
  getCompany,
  mapDistributor
} from './company.controller.js';

const companyRoutes = Router();
companyRoutes.use(verifyJwt);
companyRoutes.get('/current', authorize('read', 'Company'), asyncHandler(getCompany));
companyRoutes.post('/manufacturers', authorize('create', 'Manufacturer'),
  asyncHandler(createManufacturer)
);
companyRoutes.post(
  '/distributors',
  authorize('create', 'Distributor'),
  asyncHandler(createDistributor)
);
companyRoutes.post(
  '/map-distributor',
  authorize('map', 'Company'),
  asyncHandler(mapDistributor)
);

export { companyRoutes };
