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
const all = (req, res) => {
  res.render('applications/all', {
    webhooks: 'all landing',
  });
};

/**
 * Add a new Webhook
 * @param {object} res - HTTP Response
 */
const add = (req, res) => {
  res.render('applications/new', {
    webhooks: 'new Webhook',
  });
};

/**
 * View/edit an individual Webhook
 * @param {object} res - HTTP Response
 */
const one = (req, res) => {
  res.render('applications/one', {
    webhooks: 'view Webhook',
  });
};

/**
 * View/edit an individual Webhook
 * @param {object} res - HTTP Response
 */
const save = (req, res) => {
  res.redirect(`/${config.applications.base}`);
};

module.exports = {
  all,
  add,
  one,
  save,
};
