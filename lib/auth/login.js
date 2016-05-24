'use strict';

/**
 * @fileoverview Login middleware
 */
const connectEnsureLogin = require('connect-ensure-login');
const loginMiddleware = connectEnsureLogin.ensureLoggedIn('/login');

module.exports = loginMiddleware;
