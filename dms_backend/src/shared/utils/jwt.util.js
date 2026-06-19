import jwt from 'jsonwebtoken';
import {env} from '../../config/env.js';

export const verifyAccessToken = (token) => {

  return jwt.verify(token, env.accessSecret, {
    algorithms: ['HS256'],
  });
};

