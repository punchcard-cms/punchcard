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
 * All Applications Landing page
 * @param {object} req - HTTP Request
 * @param {object} res - HTTP Response
 *

 * @returns {boolean} returns true
 */
const all = (req, res) => {
<<<<<<< HEAD
  res.render('applications/all', {
    applications: req.applications.apps,
=======
  const apps = req.app.get('applications-apps') || [];

  res.render('applications/all', {
    applications: apps,
>>>>>>> ddbc0eae23ef7f6927580b8517142fbfacea6f11
    config: config.applications,
    structure: model.structure,
  });

  return true;
};

/**
 * Add a new Application
 * @param {object} req - HTTP Request
 * @param {object} res - HTTP Response
 * @param {object} next - Express callback
 *
 * @returns {promise} content-types promise
 *
 * TODO: Content-Types errors need to be vastly expanded to properly use promise catch for error
 * https://github.com/punchcard-cms/content-types/issues/112
 */
const add = (req, res, next) => {
  const errors = _.get(req.session, 'form.applications.save.errors', {});
  const values = _.get(req.session, 'form.applications.save.content', {});
  const merged = req.app.get('applications-merged') || {};

  _.unset(req.session, 'form.applications.save');

  return types.only('applications', values, [merged], config).then(only => {
    return types.form(only, errors, config).then(form => {
      res.render('applications/add', {
        form,
        action: `/${config.applications.base}/${config.applications.actions.save}`,
        config: config.applications,
        structure: model.structure,
        button: config.applications.actions.save,
      });
    });
  }).catch(e => {
    const err = {
      message: e.message,
      safe: `/${config.applications.base}`,
      status: 500,
    };

    return next(err);
  });
};

/**
 * View/edit an individual Application
 * @param {object} req - HTTP Request
 * @param {object} res - HTTP Response
 * @param {object} next - Express callback
 *
 * @returns {promise} resolves/rejects promise
 */
const one = (req, res, next) => {
  const id = _.get(req.session, 'form.applications.edit.id', null);
  const errors = _.get(req.session, 'form.applications.save.errors', {});
  const values = _.get(req.session, 'form.applications.save.content', {});
  const merged = req.app.get('applications-merged') || {};
  let app = _.get(req.session, 'form.applications.edit.app', null);

  _.unset(req.session, 'form.applications.edit');
  _.unset(req.session, 'form.applications.save');

  // something went wrong on save:
  if (Object.keys(values).length > 0 && id) {
    // add the previous session data back in
    _.set(req.session, 'form.applications.edit', {
      id,
    });

    // grab the edit form and inject errors and values from req.session
    return types.only('applications', values, [merged], config).then(only => {
      return types.form(only, errors, config).then(form => {
        res.render('applications/one', {
          form,
          action: `/${config.applications.base}/${config.applications.actions.save}`,
          config: config.applications,
          structure: model.structure,
          button: config.applications.actions.update,
          app,
        });

        return true;
      });
    });
  }

  // grab the application from the database
  return database('applications').where({
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

    app = rows[0];
    app.client = {
      id: app['client-id'],
      secret: app['client-secret'],
    };

    // add session data for this application
    _.set(req.session, 'form.applications.edit', {
      id: rows[0].id,
      app,
    });

    const data = {
      'name': {
        'text': {
          'value': app.name,
        },
      },
      'live-endpoint': {
        'url': {
          'value': app['live-endpoint'],
        },
      },
      'updated-endpoint': {
        'url': {
          'value': app['updated-endpoint'],
        },
      },
      'sunset-endpoint': {
        'url': {
          'value': app['sunset-endpoint'],
        },
      },
    };

    return types.only('applications', data, [merged], config);
  }).then(only => {
    return types.form(only, null, config);
  }).then(form => {
    res.render('applications/one', {
      form,
      action: `/${config.applications.base}/${config.applications.actions.save}`,
      config: config.applications,
      button: config.applications.actions.update,
      app,
    });

    return true;
  }).catch(e => {
    const err = {
      message: e.message,
      safe: `/${config.applications.base}`,
      status: 404,
    };

    return next(err);
  });
};

/**
 * Create a new client secret
 * @param {object} req - HTTP Request
 * @param {object} res - HTTP Response
 * @param {object} next - Express callback
 *
 * @returns {promise} resolves/rejects promise
 */
const secret = (req, res, next) => {
  const id = _.get(req.session, 'form.applications.edit.id', null);
  const referrer = req.get('Referrer');

  const data = {
    'client-secret': uuid.v4(),
  };

  if (!_.includes(referrer, `/${config.applications.base}/${id}`)) {
    const err = {
      message: 'Secret can only be changed from the application edit screen',
      safe: `/${config.applications.base}`,
      status: 500,
    };

    return next(err);
  }

  return database('applications').where('id', '=', id).update(data).then(() => {
    res.redirect(`/${config.applications.base}/${id}`);

    return data['client-secret'];
  }).catch(e => {
    const err = {
      message: e.message,
      safe: `/${config.applications.base}`,
      status: 500,
    };

    return next(err);
  });
};

/**
 * View/edit an individual Application
 * @param {object} req - HTTP Request
 * @param {object} res - HTTP Response
 *
 * @returns {promise} database promise
 */
const save = (req, res) => {
  const id = _.get(req.session, 'form.applications.edit.id', null);
  const referrer = (_.get(req.session, 'referrer') || req.get('Referrer')) || `/${config.applications.base}`;
  const apps = req.app.get('applications-apps') || [];
  const merged = req.app.get('applications-merged') || {};

  // user hit delete button
  if (req.body.submit === config.applications.actions.delete && id) {
    return database('applications').where('id', '=', id).del().then(() => {
      _.unset(req.session, 'form.applications.edit');
      _.unset(req.session, 'form.applications.save');

      // find this app in the request apps object
<<<<<<< HEAD
      const index = req.applications.apps.findIndex(app => {
        return app.id === id;
      });

      // remove this app from the request's apps object
      req.applications.apps.splice(index, 1);
=======
      const index = apps.findIndex(app => {
        return app.id === id;
      });

      // remove this app from the application's settings
      req.app.set('applications-apps', apps.splice(index, 1));
>>>>>>> ddbc0eae23ef7f6927580b8517142fbfacea6f11

      res.redirect(`/${config.applications.base}`);

      return true;
    });
  }

  // Validation
  const validated = types.form.validate(req.body, merged, 'save');

  if (validated === true) {
    const data = {
      'name': req.body['name--text'],
      'live-endpoint': req.body['live-endpoint--url'],
      'updated-endpoint': req.body['updated-endpoint--url'],
      'sunset-endpoint': req.body['sunset-endpoint--url'],
    };

    // `update` is for the Edit form
    if (req.body.submit === config.applications.actions.update && id) {
      return database('applications').where('id', '=', id).update(data).returning('*').then((updated) => {
        _.unset(req.session, 'form.applications.edit');
        _.unset(req.session, 'form.applications.save');

        // find this app in the request apps object
<<<<<<< HEAD
        const index = req.applications.apps.findIndex(app => {
          return app.id === id;
        });

        // we WANT to update this app in the request's apps object
        req.applications.apps[index] = updated[0]; // eslint-disable-line no-param-reassign
=======
        const index = apps.findIndex(app => {
          return app.id === id;
        });

        // update this app in the application's settings
        apps[index] = updated[0];
        req.app.set('applications-apps', apps);

>>>>>>> ddbc0eae23ef7f6927580b8517142fbfacea6f11

        res.redirect(`/${config.applications.base}`);

        return true;
      });
    }

    // on add, create fresh id/secret
    data['client-id'] = uuid.v4();
    data['client-secret'] = uuid.v4();

    return database('applications').insert(data).returning('*').then((added) => {
      _.unset(req.session, 'form.applications.save');

      // add this new app to the request's apps object
<<<<<<< HEAD
      req.applications.apps.push(added[0]);
=======
      apps.push(added[0]);
      req.app.set('applications-apps', apps);
>>>>>>> ddbc0eae23ef7f6927580b8517142fbfacea6f11

      res.redirect(`/${config.applications.base}/${added[0].id}`);

      return true;
    });
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
  secret,
  save,
};
