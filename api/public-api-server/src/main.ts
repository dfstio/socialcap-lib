import 'module-alias/register';
// import Fastify from 'fastify';
import { fastify, logger } from "./global";
import fastifyJwt from '@fastify/jwt';
import fastifyRoutes from '@fastify/routes';
import helperRoutes from './routes/helper-routes';
import queryRoutes from './routes/query-routes';
import mutationRoutes from './routes/mutation-routes';

// setup JWT plugin
fastify.register(fastifyJwt, { secret: 'MYYYYsupersecret' })

// show all routes on server startup (just for debug)
fastify.register(fastifyRoutes);

fastify
  .register(helperRoutes)
  .register(queryRoutes)
  .register(mutationRoutes);

/**
 * Run the server!
 */
fastify.listen({ port: 3080 }, (err, address) => {
  if (err) {
    logger.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`);
  console.log(fastify.routes);
})