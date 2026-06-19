import { Router } from 'express';
// import { authRoutes } from '../modules/auth/auth.routes.js';
// import { userRoutes } from '../modules/users/users.routes.js';
// import { companyRoutes } from '../modules/company/company.routes.js';
import { salesRoutes } from '../modules/sales/sales.routes.js';
import {stockRouters} from '../modules/stockitem/stockItem.routes.js';
import { outletRouters } from '../modules/outlets/outlet.routes.js';
import { purchaseRoutes } from '../modules/purchase/purchase.routes.js';
import { purchaseOrderRoutes } from '../modules/purchase-order/purchase-order.routes.js';
import { salesOrderRoutes } from '../modules/sales-order/sales-order.routes.js';
import authRoutes from "../modules/auth/auth.routes.js";
import manufacturerRoutes from '../modules/manufacturer/manufacturer.routes.js';
import distributorRoutes from "../modules/distributor/distributor.routes.js";
import { userRoutes } from '../modules/users/users.routes.js';
const apiRouter = Router();
// apiRouter.use('/auth', authRoutes);
// apiRouter.use('/users', userRoutes);
// apiRouter.use('/company', companyRoutes);
apiRouter.use('/sale-vouchers', salesRoutes);
apiRouter.use('/stock',stockRouters);
apiRouter.use('/outlets',outletRouters)
apiRouter.use('/purchase-vouchers',purchaseRoutes)
apiRouter.use('/purchase-orders',purchaseOrderRoutes)
apiRouter.use('/sale-orders',salesOrderRoutes)
apiRouter.use("/auth", authRoutes);
apiRouter.use('/manufacturers', manufacturerRoutes);
apiRouter.use("/distributors", distributorRoutes);
apiRouter.use('/user',userRoutes)
export { apiRouter };

