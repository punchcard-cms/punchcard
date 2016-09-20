'use strict';

/**
 * @fileoverview Applications routing functions
 *
 */
const config = require('config');
const _ = require('lodash');
const types = require('punchcard-content-types');
const uuid = require('uuid');

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
  const errors = _.get(req.session, `form.applications.save.errors`, {});
  const values = _.get(req.session, `form.applications.save.content`, {});

  _.unset(req.session, 'form.content.save');

  return types.only(config.applications.base, values, [req.applications.merged], config).then(merged => {
    return types.form(merged, errors, config).then(form => {
      res.render('applications/add', {
        form,
        action: req.url.replace(config.applications.actions.add, config.applications.actions.save),
        config: config.applications,
        structure: model.structure,
        button: config.applications.actions.save,
      });
    });
  });

};

/**
 * View/edit an individual Webhook
 * @param {object} res - HTTP Response
 */
const one = (req, res, next) => {
  const id = _.get(req.session, `form.applications.edit.id`, null);
  const errors = _.get(req.session, `form.applications.save.errors`, {});
  const values = _.get(req.session, `form.applications.save.content`, {});

  let data;

  _.unset(req.session, 'form.content.edit');
  _.unset(req.session, 'form.content.save');

  // something went wrong on save:
  if (Object.keys(values).length > 0 && id) {
    // add the previous session data back in
    _.set(req.session, 'form.applications.edit', {
      id,
    });

    // grab the edit form and inject errors and values from req.session
    return types.only(config.applications.base, values, [req.applications.merged], config).then(merged => {
      return types.form(merged, errors, config).then(form => {
        res.render('applications/one', {
          form,
          action: req.url.replace(config.applications.actions.edit, config.applications.actions.save),
          config: config.applications,
          structure: model.structure,
          button: config.applications.actions.update,
        });
      });
    });
  }

  // grab the application from the database
  return database(`${config.applications.base}`).where({
    id: req.params.id,
  }).then(rows => {
    // application not in database; send to 404
    if (rows.length < 1) {
      const err = {
        message: config.applications.messages.missing.id.replace('%id', req.params.id),
        safe: `/${config.applications.base}`,
        status: 404,
      };

      return next(err);
    }

    // add session data for this application
    _.set(req.session, 'form.applications.edit', {
      id: rows[0].id,
    });

    data = {
      'name': {
        'text': {
          'value': rows[0].name,
        },
      },
      'live-endpoint': {
        'url': {
          'value': rows[0]['live-endpoint'],
        },
      },
      'updated-endpoint': {
        'url': {
          'value': rows[0]['updated-endpoint'],
        },
      },
      'sunset-endpoint': {
        'url': {
          'value': rows[0]['sunset-endpoint'],
        },
      },
    };

    return types.only(config.applications.base, data, [req.applications.merged], config);
  }).then(only => {
    return types.form(only, null, config);
  }).then(form => {
    res.render('applications/one', {
      form,
      action: `/${config.applications.base}/${config.content.actions.save}`,
      data,
      config: config.content,
      button: config.applications.actions.update,
    });
  }).catch(e => {
    next(e);
  });
};

/**
 * View/edit an individual Webhook
 * @param {object} res - HTTP Response
 */
const save = (req, res, next) => {
  const id = _.get(req.session, `form.applications.edit.id`, null);
  const referrer = (_.get(req.session, 'referrer') || req.get('Referrer')) || `/${config.applications.base}`;

  // Validation
  const validated = types.form.validate(req.body, req.applications.merged, 'save');

  if (validated === true) {
    const data = {
      'name': req.body['name--text'],
      'live-endpoint': req.body['live-endpoint--url'],
      'updated-endpoint': req.body['updated-endpoint--url'],
      'sunset-endpoint': req.body['sunset-endpoint--url'],
    };

    // `update` is for the Edit form
    if (req.body.submit === config.applications.actions.update && id) {
      return database(`${config.applications.base}`).where('id', '=', id).update(data).then(() => {
        _.unset(req.session, 'form.content.edit');
        _.unset(req.session, 'form.content.save');

        return res.redirect(`/${config.applications.base}`);
      });
    }
    else {

      // on add, create fresh id/secret
      data['client-id'] = uuid.v4();
      data['client-secret'] = uuid.v4();

      return database(`${config.applications.base}`).insert(data).then(() => {
        _.unset(req.session, 'form.content.save');

        return res.redirect(`/${config.applications.base}`);
      });
    }
  }

  _.set(req.session, 'form.applications.save', {
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
