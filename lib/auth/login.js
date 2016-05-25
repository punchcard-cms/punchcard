'use strict';

/**
 * @fileoverview Login middleware
 */
const config = require('config');

/**
 * Ensure logged in options
 * @typedef {Object} ensureLoggedIn--options
 * @property {string} redirectTo - Redirect path
 * @property {string} returnTo - Return path
 * @property {string} role - User role level
 */

/*
 * Check login status
 *
 * @param {ensureLoggedIn--options} opt options for login check
 */
const ensureLoggedIn = (opt) => {
  let options;
  const url = config.login.loginPath;
  options = opt;

  if (typeof options !== 'object') {
    options = {
      redirectTo: config.login.loginPath,
      returnTo: config.login.logoutPath,
    };
  }

  if (!options.hasOwnProperty('redirectTo')) {
    options.redirectTo = config.login.loginPath;
  }

  return (req, res, next) => {
    // check if authenticated
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      if (req.session) {
        req.session.returnTo = req.originalUrl || req.url; // eslint-disable-line no-param-reassign
      }

      return res.redirect(url);  // eslint-disable-line newline-before-return
    }

    // check for role
    if (options.hasOwnProperty('role')) {
      if (req.user.role !== options.role) { // TODO: needs to be changed to check level is WITHIN range
        const err = new Error('Permission denied: you do not have access to this cool page.');
        err.status = 403;
        res.render('error', {
          message: err.message,
          error: err,
        });
      }
    }

    next();

    return true;
  };
};

module.exports = ensureLoggedIn;
