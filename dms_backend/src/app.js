import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
// import { logger } from './middlewares/logger.js';
// import { notFound } from './middlewares/not-found.js';
// import { errorHandler } from './middlewares/error-handler.js';
import cookieParser from "cookie-parser";
export const app = express();
// const apiLimiter = rateLimit({
//   windowMs: env.rateLimitWindowMs,
//   max: env.rateLimitMaxRequests,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: {
//     message: 'Too many requests from this IP. Please try again later.'
//   }
// });

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
);
// app.use(logger);

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use(cookieParser());
// app.use('/api', apiLimiter);

app.get('/api/health', (request, response) => {
  response.json({
    success: true,
    message: 'API is running'
  });
});

app.use('/api', apiRouter);
// app.use(notFound);
// app.use(errorHandler);
