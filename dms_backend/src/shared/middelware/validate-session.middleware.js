// shared/middleware/validate-session.middleware.js

// import SessionService from "../../modules/auth/session.service.js";

// export default async function validateSessionMiddleware(req, res, next) {
//   try {
//     const { sessionId, manufacturerId, distributorId } = req.auth || {};

//     if (!sessionId) {
//       return res.status(401).json({
//         success: false,
//         message: "Session missing in auth context",
//         code: "SESSION_MISSING"
//       });
//     }

//     const result = await SessionService.validateSession({
//       sessionId,
//       manufacturerId,
//       distributorId
//     });

//     if (!result.valid) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid session",
//         reason: result.reason,
//         code: "SESSION_INVALID"
//       });
//     }

//     // attach trusted session context
//     req.ctx = req.ctx || {};
//     req.ctx.session = result.session;

//     // optional hardening: mark auth as verified
//     req.auth.sessionVerified = true;

//     return next();
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: "Session validation failure",
//       error: err.message
//     });
//   }
// } 
// import sessionService from "../../modules/auth/session.service.js";
// import {AppError} from "../app-error.js";

// /**
//  * Enterprise-grade DB session validation layer
//  * Acts as security gate before context building
//  */
// export const validateSessionMiddleware = async (req, res, next) => {
//   try {
//     const { sessionId, manufacturerId } = req.auth;
  
//     if (!sessionId) {
//       return next(new AppError("Session ID missing", 401));
//     }

//     // 1. Fetch session from DB (authoritative source)
//     const session = await sessionService.getSessionById(sessionId);

//     if (!session) {
//       return next(new AppError("Invalid session", 401));
//     }

//     // 2. Check session status
//     if (session.status !== "ACTIVE") {
//       return next(new AppError("Session is not active", 401));
//     }

//     // 3. Expiry validation
//     const now = new Date();

//     if (session.expires_at && new Date(session.expires_at) < now) {
//       await sessionService.expireSession(sessionId);
//       return next(new AppError("Session expired", 401));
//     }

//     // 4. Tenant boundary enforcement (CRITICAL)
//     if (session.manufacturer_id !== manufacturerId) {
//       return next(new AppError("Tenant boundary violation", 403));
//     }

//     // 5. Optional: attach validated session ONLY (not full context)
//     req.session = {
//       sessionId: session.session_id,
//       manufacturerId: session.manufacturer_id,
//       distributorId: session.distributor_id,
//       status: session.status,
//       userId: session.user_id,
//       userType: session.user_type,
//       expiresAt: session.expires_at
//     };

//     return next();
//   } catch (error) {
//     return next(new AppError("Session validation failed", 500));
//   }
// };
import sessionService from '../../modules/auth/session.service.js';
import { AppError } from '../app-error.js';

export const validateSessionMiddleware =
  async (req, res, next) => {

    try {

      const { sessionId } = req.auth;

      if (!sessionId) {
        return next(
          new AppError(
            'Unauthorized',
            401
          )
        );
      }

      const session =
        await sessionService.getSessionById(
          sessionId
        );

      if (!session) {
        return next(
          new AppError(
            'Invalid session',
            401
          )
        );
      }

      if (session.status !== 'ACTIVE') {
        return next(
          new AppError(
            'Session inactive',
            401
          )
        );
      }

      if (
        session.expires_at &&
        new Date(session.expires_at) < new Date()
      ) {
        return next(
          new AppError(
            'Session expired',
            401
          )
        );
      }

      req.session = {
        sessionId: session.session_id,
        userId: session.user_id,
        manufacturerId: session.manufacturer_id,
        distributorId: session.distributor_id,
        userType: session.user_type
      };

      return next();

    } catch (error) {

      return next(
        new AppError(
          'Session validation failed',
          500
        )
      );
    }
  };