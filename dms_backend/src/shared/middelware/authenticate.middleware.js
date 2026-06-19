
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import extractAccessToken from '../utils/token-extractor.util.js';
import { verifyAccessToken } from '../utils/jwt.util.js';
import { db } from '../../config/database.js';

const authenticate = async (req, res, next) => {
  try {
  
    const token = extractAccessToken(req);
    if (token) {
      const decoded = verifyAccessToken(token);
      const requiredClaims = ['sessionId','userId','manufacturerId','userType'];

      const missingClaims = requiredClaims.filter( claim => decoded?.[claim] === undefined);

      if (missingClaims.length > 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token payload',
          code: 'AUTH_TOKEN_PAYLOAD_INVALID'
        });
      }

      req.auth = {
        sessionId: decoded.sessionId,
        userId: decoded.userId,
        manufacturerId: decoded.manufacturerId,
        distributorId: decoded.distributorId || null,
        userType: decoded.userType
      };

      return next();
    }


    const apiKey = req.headers['x-api-key'].trim();
    console.log(apiKey)
    if (apiKey) {

      const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
      console.log(keyHash)
      const [rows] = await db.query(
        `
      SELECT us.session_id, us.user_id, us.manufacturer_id, us.distributor_id,u.user_type FROM api_keys ak INNER JOIN user_sessions us 
      INNER JOIN users u ON us.user_id = ak.user_id and u.id = ak.user_id WHERE ak.key_hash = ? AND ak.status = 'ACTIVE' AND us.status = 'ACTIVE' AND us.expires_at > NOW() ORDER BY us.updated_at DESC LIMIT 1;
        `,
        [apiKey]
      );
      
      if (!rows.length) {
        return res.status(401).json({
          success: false,
          message: 'Invalid API key',
          code: 'AUTH_API_KEY_INVALID'
        });
      }

      const session = rows[0];

      req.auth = {
        sessionId: session.session_id,
        userId: session.user_id,
        manufacturerId: session.manufacturer_id,
        distributorId: session.distributor_id,
        userType: session.user_type
      };

      return next();
    }



    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });

  } catch (error) {

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Access token expired',
        code: 'AUTH_TOKEN_EXPIRED'
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token',
        code: 'AUTH_TOKEN_INVALID'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
};

export default authenticate;