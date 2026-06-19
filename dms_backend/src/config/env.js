import dotenv from 'dotenv';
dotenv.config();
export const env = {
  nodeEnv: process.env.NODE_ENV ,
  port: Number(process.env.PORT),
  clientUrl: process.env.CLIENT_URL,
  baseURL: process.env.BASE_URL,
  dbHost: process.env.DB_HOST,
  dbPort: Number(process.env.DB_PORT ),
  dbName: process.env.DB_NAME,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ),
  rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS),
  accessSecret: process.env.JWT_ACCESS_SECRET,
  accessExpires: process.env.JWT_ACCESS_EXPIRES ,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshExpires: process.env.JWT_REFRESH_EXPIRES ,
};
