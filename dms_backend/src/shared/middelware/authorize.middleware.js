// shared/middleware/authorize.middleware.js

import { AppError } from "../app-error.js";

/**
 * RBAC Permission Middleware
 *
 * Usage:
 * authorize("sales_order.create")
 *
 * Features:
 * - permission based access
 * - supports manufacturer users
 * - supports distributor users
 * - supports super admin
 * - reusable across all modules
 */
 
export const authorize =
  (...requiredPermissions) => {

    return (req, res, next) => {

      try {
        console.log("auth", req.auth)
        if (!req.ctx) {
          return next(
            new AppError(
              "Request context missing",
              500
            )
          );
        }

        const {
          actor,
          authorization
        } = req.ctx;
        const auth = req.auth

        // ------------------------------------------------
        // Super admin bypass
        // ------------------------------------------------

        if (
          auth?.userType === "MANUFACTURER"
        ) {
          return next();
        }

        // ------------------------------------------------
        // Permission extraction
        // ------------------------------------------------

        const userPermissions =
          authorization?.permissions || [];

        
        // ------------------------------------------------
        // Permission check
        // ------------------------------------------------

        const hasPermission =
          requiredPermissions.every(
            (permission) =>
              userPermissions.includes(permission)
          );

        if (!hasPermission) {
          return next(
            new AppError(
              "You do not have permission to perform this action",
              403
            )
          );
        }

        // ------------------------------------------------
        // Authorized
        // ------------------------------------------------

        return next();

      } catch (error) {

        return next(
          new AppError(
            error.message || "Authorization failed",
            error.statusCode || 500
          )
        );
      }
    };
  };