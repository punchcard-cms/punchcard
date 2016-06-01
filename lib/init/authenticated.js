'use strict';

/**
 * @fileoverview Login check middleware
 */
const config = require('config');
const _ = require('lodash');

/*
 * Check authenticated status. Redirect to login page
 *
 * @param {object} req Express HTTP request
 * @param {object} res Express HTTP response
 * @param {object} next Express callback
 *
 */
const authenticated = (req, res, next) => {
  if ((!req.isAuthenticated || !req.isAuthenticated()) && req.url !== '/login' && !req.url.startsWith('/css') && !req.url.startsWith('/js') && !req.url.startsWith('/images') && !req.url.startsWith('/favicon')) {
    res.redirect('/login');
  } else {
    next();
  }

};

/**
 * @param {object} app - Express app
 *
 * @returns {object} app - Modified Express app
 */
const authInit = (app) => {
  return new Promise((res) => {

    app.use(authenticated);

    res(app);
  });
};

module.exports = authInit;
