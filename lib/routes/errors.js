'use strict';

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
     * @param {function} next - Next handler
     */
    app.use((req, res, next) => {
      const err = new Error(`Not Found: ${req.url}`);
      err.status = 404;
      next(err);
    });

    /*
     * @name Error Handling
     * @description Handles errors in Express
     *
     * @param {object} err - Error being handled
     * @param {object} req - HTTP Request
     * @param {object} res - HTTP Response
     */

    app.use((err, req, res) => {
      const error = {
        message: err.message,
        error: {},
      };

      // If in development, will print stacktrace
      if (app.get('env') === 'development') {
        error.error = err;
      }

      res.status(err.status || 500);
      res.render('error', error);
    });

    resolve(app);
  });
};
