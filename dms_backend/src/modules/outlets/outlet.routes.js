import { Router } from "express";
import outletController from "./outlet.controller.js";

import authenticate from "../../shared/middelware/authenticate.middleware.js";
import { validateSessionMiddleware } from "../../shared/middelware/validate-session.middleware.js";
import { requestContextMiddleware } from "../../shared/middelware/request-context.middelware.js";
import { authorize } from "../../shared/middelware/authorize.middleware.js";
import hierarchyResolverMiddleware from "../../shared/middelware/hierarchyResolver.middleware.js";

const outletRouters = Router();

/**
 * GLOBAL PIPELINE (ERP STYLE)
 */
outletRouters.use(authenticate);
outletRouters.use(validateSessionMiddleware);

outletRouters.use(hierarchyResolverMiddleware)

/**
 * Routes (clean business layer only)
 */
outletRouters.get("/getOutlets" ,outletController.getOutlets);

export { outletRouters };