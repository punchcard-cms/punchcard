'use strict';

const config = require('config');

const utils = require('./utils');

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

  return utils.id(request).then(() => {
    return next();
  }).catch(error => {
    err.message = error;

    return next(err);
  });
};

module.exports = url;
