'use strict';

/**
 * @fileoverview Login middleware
 */
const config = require('config');

/*
 * Check login status
 *
 * @param {object} opt options for login check
 */
const ensureLoggedIn = (opt) => {
  let options;
  let setReturnTo;
  let url;
  options = opt;

  if (typeof options !== 'object') {
    options = {
      redirectTo: config.login.loginPath,
      returnTo: config.login.logoutPath,
    };
  }

  if (!options.hasOwnProperty('redirectTo')) {
    url = config.login.loginPath;
    options.redirectTo = config.login.loginPath;
  }

  if (!options.hasOwnProperty('setReturnTo')) {
    setReturnTo = config.login.logoutPath;
    options.setReturnTo = config.login.logoutPath;
  }

  return (req, res, next) => {
    // if they're not authenticated, send them to login
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      if (setReturnTo && req.session) {
        req.session.returnTo = req.originalUrl || req.url; // eslint-disable-line no-param-reassign
      }

      // this was causing a circular newline linting bug
      return res.redirect(url); // eslint-disable-line newline-before-return
    }

    // check for role
    if (options.hasOwnProperty('role')) {
      if (req.user.role !== options.role) { // TODO: needs to be changed to check level is WITHIN range
        return res.redirect('/403');
      }
    }

    next();

    return true;
  };
};

module.exports = ensureLoggedIn;
