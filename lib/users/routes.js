'use strict';

/**
 * @fileoverview User routing functions
 *
 */
const config = require('config');

const database = require('../database');

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
  all,
  add,
  one,
  save,
};
