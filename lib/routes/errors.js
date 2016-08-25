'use strict';

const routes = require('../errors/routes');

/*
 * Error Route Handling
 * @description Adds error route handling to an Express app
 *
 * @param {object} application - Express Application
 * @returns {object} - Configured Express Application
 */
module.exports = application => {
  return new Promise(resolve => {
    const app = application;

    /*
     * @name Not Found Handling
     * @description catch 404 errors and forward to error handler
     *
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
     */
    app.use((req, res) => {
      return routes.notFound(req, res);
    });

    /*
     * @name Error Handling
     * @description Handles errors in Express
     *
     * @param {object} err - Error being handled
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
     */

    // eslint disabled because without next the error handler is ignored
    app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
      return routes.errors(err, req, res, next, app);
    });

    resolve(app);
  });
};
