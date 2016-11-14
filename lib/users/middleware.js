'use strict';

const config = require('config');

const utils = require('../routes/utils');

/**
 * Checking a user administration url's parameters
 *
 * @param {object} req - HTTP Request
 * @param {object} res - HTTP Response
 * @param {object} next - Express callback
 *
 * @returns {function} express next function
 */
const url = (req, res, next) => {
  const request = req;
  const err = {
    message: '',
    safe: `/${config.users.base}`,
    status: 404,
  };
  let action;

  // if there are no url parameters or type parameter, we're done checking this url
  if (!request.hasOwnProperty('params') || request.params.hasOwnProperty('id')) {
    return new Promise((resolve) => {
      resolve(next);
    });
  }

  action = request.params.id;

  return utils.actions(action, 'users').then(() => {
    return next();
  }).catch(error => {
    err.message = error;

    return next(err);
  });
};

module.exports = url;
