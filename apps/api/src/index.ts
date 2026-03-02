/**
 * Buzzy Today API — Main entry point.
 * Fastify REST API server with CORS, structured logging, and route registration.
 *
 * @module @buzzy/api
 */

import Fastify, { type FastifyError } from 'fastify';
import cors from '@fastify/cors';
import { logger } from './logger.js';
import { registerRoutes } from './routes/index.js';

const PORT = parseInt(process.env['API_PORT'] ?? '3001', 10);
const HOST = process.env['API_HOST'] ?? '0.0.0.0';

/**
 * Creates and configures the Fastify server instance.
 *
 * @returns Configured Fastify instance
 */
async function buildServer() {
  const server = Fastify({
    logger: false, // We use our own winston logger
  });

  await server.register(cors, {
    origin: true,
    credentials: true,
  });

  /** Global error handler */
  server.setErrorHandler((error: FastifyError, _request, reply) => {
    logger.error('Unhandled error', {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
    });

    const statusCode = error.statusCode ?? 500;
    void reply.status(statusCode).send({
      error: {
        message: statusCode >= 500 ? 'Internal server error' : error.message,
        code: error.code ?? 'INTERNAL_ERROR',
        statusCode,
      },
    });
  });

  /** Health check */
  server.get('/health', async () => ({
    status: 'ok',
    service: 'buzzy-api',
    timestamp: new Date().toISOString(),
  }));

  /** Register all route groups */
  await registerRoutes(server);

  return server;
}

/**
 * Starts the API server.
 */
async function start() {
  try {
    const server = await buildServer();
    await server.listen({ port: PORT, host: HOST });
    logger.info(`Buzzy API server listening on ${HOST}:${PORT}`);
  } catch (err) {
    logger.error('Failed to start server', { error: err });
    process.exit(1);
  }
}

start();
