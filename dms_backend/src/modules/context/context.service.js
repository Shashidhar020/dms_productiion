// modules/context/context.service.js

import contextRepository from "./context.repository.js";
import { AppError } from "../../shared/app-error.js";

class ContextService {

  async buildRequestContext(session) {
  
    const {
      userId,
      userType,
      manufacturerId,
      distributorId,
      sessionId,
      expiresAt
    } = session;

    // ---------------------------------------------------
    // Distributor hierarchy resolution
    // ---------------------------------------------------

    let distributorContext = null;

    if (distributorId) {

      const hierarchyPath = [];

      let currentDistributorId = distributorId;

      while (currentDistributorId) {

        const distributor =
          await contextRepository.getDistributorById(
            currentDistributorId,
            manufacturerId
          );

        if (!distributor) {
          throw new AppError(
            "Distributor hierarchy invalid",
            403
          );
        }

        hierarchyPath.unshift(distributor.id);

        currentDistributorId =
          distributor.parent_distributor_id;

        distributorContext = {
          id: distributor.id,
          level: distributor.distributor_level,
          parentDistributorId:
            distributor.parent_distributor_id,
          hierarchyPath
        };
      }
    }

    // ---------------------------------------------------
    // Authorization context
    // ---------------------------------------------------

    const roles =
      await contextRepository.getUserRoles(
        userId,
        manufacturerId
      );

    const permissions =
      await contextRepository.getUserPermissions(
        userId,
        manufacturerId
      );
    
    // ---------------------------------------------------
    // Final ERP execution context
    // ---------------------------------------------------

    const ctx = {
      actor: {
        userId,
        userType,
        manufacturerId,
        distributorId
      },

      tenant: {
        manufacturerId
      },

      distributor: distributorContext,

      session: {
        sessionId,
        expiresAt
      },

      authorization: {
        roles,
        permissions
      },

      requestMeta: {
        requestTime: new Date().toISOString()
      }
    };

    return Object.freeze(ctx);
  }
}

export default new ContextService();