'use strict';

/**
 * @fileoverview Access Control Lists Init
 */
const acl = require('../auth/acl');

/**
 * @param {object} app - Express app
 *
 * @returns {object} app - Modified Express app
 */
const aclInit = (app) => {
  return new Promise((res) => {
    app.use(acl.reregsiter);

    res(app);
  });
};

module.exports = aclInit;
