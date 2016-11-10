'use strict';

const config = require('config');

const utils = require('./utils');
const workflows = require('../../workflows/utils');


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

  // if there are no url parameters or type parameter, we're done checking this url
  if (!request.hasOwnProperty('params') || !request.params.hasOwnProperty('type')) {
    return next();
  }


  return utils.id(request).then(() => {
    return next();
  }).catch(error => {
    err.message = error;

    return next(err);
  });
};

module.exports = url;
