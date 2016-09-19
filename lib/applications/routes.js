'use strict';

/**
 * @fileoverview Applications routing functions
 *
 */
const config = require('config');
const _ = require('lodash');
const types = require('punchcard-content-types');

const database = require('../database');
const model = require('./model');
const utils = require('../utils');

/**
 * All Webhooks Landing page
 * @param {object} res - HTTP Response
 */
const all = (req, res) => {
  return database
    .select('*')
    .from(`${config.applications.base}`)
    .orderBy('name', 'DESC').then(rws => {
      // add itentifier to each row
      const rows = utils.routes.identifier(rws, req.applications.merged);

      res.render('applications/all', {
        applications: rows,
        config: config.applications,
        structure: model.structure,
      });
    });
};

/**
 * Add a new Webhook
 * @param {object} res - HTTP Response
 */
const add = (req, res, next) => {
  const errors = _.get(req.session, `form.applications.add.errors`, {});
  const values = _.get(req.session, `form.applications.add.content`, {});

  return types.only(config.applications.base, values, [req.applications.merged], config).then(merged => {
    return types.form(merged, errors, config).then(form => {
      res.render('applications/add', {
        form,
        action: req.url.replace(config.applications.actions.add, config.applications.actions.save),
        config: config.applications,
        structure: model.structure,
      });
    });
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
const save = (req, res, next) => {
  const referrer = (_.get(req.session, 'referrer') || req.get('Referrer')) || `/${config.applications.base}`;

  // Validation
  const validated = types.form.validate(req.body, req.applications.merged, 'save');

  if (validated === true) {
    const data = {
      'name': req.body['name--text'],
      'live-endpoint': req.body['live-endpoint--text'],
      'updated-endpoint': req.body['updated-endpoint--text'],
      'sunset-endpoint': req.body['sunset-endpoint--text'],
      'client-id': req.body['client-id--text'],
      'client-secret': req.body['client-secret--text'],
    };

    return database('applications').insert(data).then(() => {
      res.redirect(`/${config.applications.base}`);
    });
  }

  _.set(req.session, 'form.applications.add', {
    errors: validated,
    content: utils.format(req.body),
  });

  return res.redirect(referrer);

};

module.exports = {
  all,
  add,
  one,
  save,
};
