/**
 *  @fileoverview Error routes
 *
 *  @author  Scott Nath
 *
 */
'use strict';

const _ = require('lodash');

/**
 * Route for a 404 error
 * @param {object} req - HTTP Request
 * @param {object} res - HTTP Response
 *
 * @returns {promise} promise containing the route
 */
const missing = (req, res) => {
  return new Promise((resolve) => {
    const message = _.get(req.session, '404.message', `Not Found: ${req.url}`);
    const safe = _.get(req.session, '404.safe');

    _.unset(req.session, '404');

    res.status(404);
    res.render('404', {
      message,
      safe,
    });
    resolve(true);
  });
};

/**
 * Route for errors
 *
 * @param {string|object} err - error object or error message string
 * @param {object} req - HTTP Request
 * @param {object} res - HTTP Response
 * @param {object} next - Express callback
 * @param {object} app Express application
 *
 * @returns {promise} promise containing the route
 */
const errors = (err, req, res, next, app) => {
  return new Promise((resolve) => {
    let error = {
      message: 'route error',
      status: '',
      safe: '/',
    };

    if (typeof err === 'object') {
      error = _.cloneDeep(err);
    }
    else if (typeof err === 'string' && err !== '') {
      error.message = err;
    }

    error.error = {};

    // If in development, will print stacktrace
    if (app.get('env') === 'development') {
      error.error = err;
    }

    res.status(error.status || 500);

    if (error.status === 404) {
      res.render('404', error);
    }
    else {
      res.render('error', error);
    }

    resolve(true);
  });
};

module.exports = {
  missing,
  errors,
};
