// // modules/auth/session.service.js

// import SessionRepository from "./session.repository.js";

// export default class SessionService {
//   static async validateSession({ sessionId, manufacturerId, distributorId }) {
//     const session = await SessionRepository.findBySessionId(sessionId);

//     if (!session) {
//       return { valid: false, reason: "SESSION_NOT_FOUND" };
//     }

//     if (session.status !== "ACTIVE") {
//       return { valid: false, reason: "SESSION_NOT_ACTIVE" };
//     }

//     if (new Date(session.expires_at) < new Date()) {
//       return { valid: false, reason: "SESSION_EXPIRED" };
//     }

//     if (session.manufacturer_id !== manufacturerId) {
//       return { valid: false, reason: "TENANT_MISMATCH" };
//     }

//     if (distributorId && session.distributor_id !== distributorId) {
//       return { valid: false, reason: "DISTRIBUTOR_SCOPE_MISMATCH" };
//     }

//     return { valid: true, session };
//   }
// }
import sessionRepository from "./session.repository.js";

class SessionService {
  async getSessionById(sessionId) {
    return await sessionRepository.findById(sessionId);
  }

  async validateActiveSession(session) {
    if (!session) return false;
    if (session.status !== "ACTIVE") return false;

    const now = new Date();
    if (session.expires_at && new Date(session.expires_at) < now) {
      await sessionRepository.expireSession(session.session_id);
      return false;
    }

    return true;
  }

  async createSession({
    userId,
    manufacturerId,
    distributorId,
    userType,
    refreshToken,
    sessionId,
    expiresAt
  }) {
    return await sessionRepository.createSession({
      userId,
      manufacturerId,
      distributorId,
      userType,
      refreshToken,
      sessionId,
      status: "ACTIVE",
      expiresAt
    });
  }

  async revokeSession(sessionId) {
    return await sessionRepository.updateSessionStatus(
      sessionId,
      "REVOKED"
    );
  }

  async expireSession(sessionId) {
    return await sessionRepository.expireSession(sessionId);
  }

  async revokeUserAllSessions(userId) {
    return await sessionRepository.revokeAllUserSessions(userId);
  }
}

export default new SessionService();