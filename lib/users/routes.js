'use strict';

/**
 * @fileoverview User routing functions
 *
 */
const config = require('config');
const _ = require('lodash');
const types = require('punchcard-content-types');

const database = require('../database');

const setup = (req, res, next) => {
  const errors = _.get(req.session, 'form.users.save.errors', {});
  const values = _.get(req.session, 'form.users.save.content', {});
  const merged = req.app.get('users-create-model') || {};
  const cfg = _.cloneDeep(config.users);
  delete cfg.actions.delete;

  return database.select('*').from('users').then(rows => {
    // if any users in DB, we redirect to the top
    if (rows.length > 1) {
      return res.redirect('/');
    }

    return types.only('users-create', values, [merged], config).then(only => {
      return types.form(only, errors, config).then(form => {
        return res.render('users/add', {
          title: 'Create an admin account for your new CMS',
          form,
          action: `/${config.users.base}/${config.users.actions.save}`,
          config: cfg,
          button: config.users.actions.save,
        });
      });
    });
  })
  .catch(e => {
    const err = {
      message: e.message,
      safe: `/${config.users.base}`,
      status: 500,
    };

    return next(err);
  });
};

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
 */
const add = () => {};

/**
 * View/edit a User
 */
const one = () => {};

/**
 * Save/delete a user
 */
const save = () => {};

module.exports = {
  setup,
  all,
  add,
  one,
  save,
};
