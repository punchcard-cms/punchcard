'use strict';

/**
 * @fileoverview User routing functions
 *
 */
const config = require('config');
const _ = require('lodash');
const types = require('punchcard-content-types');
const bcrypt = require('bcrypt-nodejs');

const database = require('../database');
const model = require('./model');
const utils = require('../utils');

/**
 * All Users Landing page
 * @param {object} req - HTTP Request
 * @param {object} res - HTTP Response
 * @param {object} next - Express callback
 *
 */
const all = (req, res, next) => {
  database.select('*').from('users').then(rows => {
    res.render('users/all', {
      title: config.users.base,
      users: rows,
      config: config.users,
    });
  })
  .catch(error => {
    next(error);
  });
};

/**
 * Add a new User
 * @param {object} req - HTTP Request
 * @param {object} res - HTTP Response
 * @param {object} next - Express callback
 *
 * @returns {promise} content-types promise
 */
const add = (req, res, next) => {
  const errors = _.get(req.session, 'form.users.save.errors', {});
  const values = _.get(req.session, 'form.users.save.content', {});
  const merged = req.app.get('users-model') || {};
  const cfg = _.cloneDeep(config.users);
  delete cfg.actions.delete;

  _.unset(req.session, 'form.users.save');

  return types.only('users', values, [merged], config).then(only => {
    return types.form(only, errors, config).then(form => {
      res.render('users/add', {
        form,
        action: `/${config.users.base}/${config.users.actions.save}`,
        config: cfg,
        structure: model.structure,
        button: config.users.actions.save,
      });
    });
  }).catch(e => {
    const err = {
      message: e.message,
      safe: `/${config.users.base}`,
      status: 500,
    };

    return next(err);
  });
};

/**
 * View/edit a User
 * @param {object} req - HTTP Request
 * @param {object} res - HTTP Response
 * @param {object} next - Express callback
 *
 * @returns {promise} resolves/rejects promise
 */
const one = (req, res, next) => {
  const id = _.get(req.session, 'form.users.edit.id', null);
  const errors = _.get(req.session, 'form.users.save.errors', {});
  const values = _.get(req.session, 'form.users.save.content', {});
  const merged = req.app.get('users-model') || {};

  _.unset(req.session, 'form.users.edit');
  _.unset(req.session, 'form.users.save');

  // something went wrong on save of existing user:
  if (Object.keys(values).length > 0 && id) {
    // add the previous session data back in
    _.set(req.session, 'form.users.edit', {
      id,
    });

    // grab the edit form and inject errors and values from req.session
    return types.only('users', values, [merged], config).then(only => {
      return types.form(only, errors, config).then(form => {
        res.render('users/one', {
          form,
          action: `/${config.users.base}/${config.users.actions.save}`,
          config: config.users,
          structure: model.structure,
          button: config.users.actions.update,
        });

        return true;
      });
    });
  }

  // grab the application from the database
  return database('users').where({
    id: req.params.id,
  }).then(rows => {
    // application not in database; send to 404
    if (rows.length < 1) {
      const err = {
        message: config.users.messages.missing.id.replace('%id', req.params.id),
        safe: `/${config.users.base}`,
        status: 404,
      };

      return next(err);
    }

    const user = rows[0];

    // add session data for this application
    _.set(req.session, 'form.users.edit', {
      id: user.id,
    });

    const data = {
      'email': {
        'email': {
          'value': user.email,
        },
      },
      'role': {
        'select': {
          'value': user.role,
        },
      },
    };

    return types.only('users', data, [merged], config);
  }).then(only => {
    return types.form(only, null, config);
  }).then(form => {
    res.render('users/one', {
      form,
      action: `/${config.users.base}/${config.users.actions.save}`,
      config: config.users,
      button: config.users.actions.update,
    });


    return true;
  }).catch(e => {
    const err = {
      message: e.message,
      safe: `/${config.users.base}`,
      status: 404,
    };

    return next(err);
  });
};

/**
 * Save/delete a user
 * @param {object} req - HTTP Request
 * @param {object} res - HTTP Response
 * @param {object} next - Express callback
 *
 * @returns {promise} database promise
 */
const save = (req, res, next) => {
  const id = _.get(req.session, 'form.users.edit.id', null);
  const referrer = (_.get(req.session, 'referrer') || req.get('Referrer')) || `/${config.users.base}`;
  const merged = req.app.get('users-model') || {};

  // user hit delete button
  if (req.body.submit === config.users.actions.delete && id) {
    return database('users').where('id', '=', id).del().then(() => {
      _.unset(req.session, 'form.users.edit');
      _.unset(req.session, 'form.users.save');

      res.redirect(`/${config.users.base}`);

      return true;
    }).catch(e => {
      // database errors getting swallowed
      console.error(e.stack); // eslint-disable-line no-console

      const err = {
        message: e.message,
        safe: `/${config.users.base}`,
        status: 500,
      };

      return next(err);
    });
  }

  // Validation
  const validated = types.form.validate(req.body, merged, 'save');

  if (validated === true) {
    const data = {
      'email': req.body['email--email'],
      'role': req.body['role--select'],
    };

    if (req.body['password--password'] !== '') {
      data.password = bcrypt.hashSync(req.body['password--password']);
    }

    // `update` is for the Edit form
    if (req.body.submit === config.users.actions.update && id !== null) {
      return database('users').where('id', '=', id).update(data).then(() => {
        _.unset(req.session, 'form.users.edit');
        _.unset(req.session, 'form.users.save');

        res.redirect(`/${config.users.base}`);

        return true;
      }).catch(e => {
        // database errors getting swallowed
        console.error(e.stack); // eslint-disable-line no-console

        const err = {
          message: e.message,
          safe: `/${config.users.base}`,
          status: 500,
        };

        return next(err);
      });
    }

    return database('users').insert(data).then(() => {
      _.unset(req.session, 'form.users.save');

      res.redirect(`/${config.users.base}`);

      return true;
    }).catch(e => {
      // database errors getting swallowed
      console.error(e.stack); // eslint-disable-line no-console

      const err = {
        message: e.message,
        safe: `/${config.users.base}`,
        status: 500,
      };

      return next(err);
    });
  }

  _.set(req.session, 'form.users.save', {
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
