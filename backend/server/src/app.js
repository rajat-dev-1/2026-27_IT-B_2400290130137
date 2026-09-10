import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { requestId } from './middleware/requestId.js';
import { requestLogger } from './middleware/requestLogger.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();

// 1. Helmet
app.use(helmet());

// 2. CORS
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id']
}));

// 3. Request ID
app.use(requestId);

// 4. Pino HTTP request logger
app.use(requestLogger);

// 5. JSON body parser
app.use(express.json({ limit: '1mb' }));

// 5.5 Cookie parser
app.use(cookieParser());

// 6. Global rate limiter
app.use(rateLimiter);

// 7. Routes
app.use('/', routes);

// 8. Not-found handler
app.use(notFound);

// 9. Global error handler
app.use(errorHandler);

export default app;
