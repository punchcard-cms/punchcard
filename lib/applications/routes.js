'use strict';

/**
 * @fileoverview Applications routing functions
 *
 */
const config = require('config');

/**
 * All Webhooks Landing page
 * @param {object} res - HTTP Response
 */
const all = (res) => {
  res.render('applications/all', {
    webhooks: 'all landing',
  });
};

module.exports = {
  all,
};
