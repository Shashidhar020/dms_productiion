// shared/middleware/request-context.middleware.js

import contextService from "../../modules/context/context.service.js";
import { AppError } from "../app-error.js";

/**
 * ERP Request Context Kernel
 *
 * Responsibilities:
 * - Build trusted execution context
 * - Resolve distributor hierarchy
 * - Prepare authorization context
 * - Attach immutable req.ctx
 *
 * DOES NOT:
 * - Authenticate JWT
 * - Validate session
 * - Enforce RBAC
 */
export const requestContextMiddleware =
  async (req, res, next) => {

    try {

      if (!req.session) {
        return next(
          new AppError(
            "Validated session missing",
            500
          )
        );
      }

      const ctx =
        await contextService.buildRequestContext(
          req.session
        );
      
      req.ctx = ctx;

      return next();

    } catch (error) {

      return next(
        new AppError(
          error.message || "Context build failed",
          error.statusCode || 500
        )
      );
    }
  };