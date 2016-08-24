'use strict';

const _ = require('lodash');

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
      const message = _.get(req.session, '404.message', `Not Found: ${req.url}`);
      const safe = _.get(req.session, '404.safe');

      _.unset(req.session, '404');

      res.status(404);
      res.render('404', {
        message,
        safe,
      });
    });

    /*
     * @name Error Handling
     * @description Handles errors in Express
     *
     * @param {object} err - Error being handled
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
     */

    app.use((err, req, res, next) => {
      const error = _.cloneDeep(err);
      error.error = {};

      // If in development, will print stacktrace
      if (app.get('env') === 'development') {
        error.error = err;
      }

      res.status(error.status || 500);
      res.render('error', error);
    });

    resolve(app);
  });
};
