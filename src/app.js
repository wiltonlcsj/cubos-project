import express from 'express';
import 'express-async-errors';
import routes from './routes';

/**
 * Class to encapsulate express component and set routes and middlewares
 * @class App
 */
class App {
  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(express.json());
  }

  routes() {
    this.server.use(routes);
  }
}

export default new App().server;