'use strict';

const config = require('config');

const utils = require('./utils');


/**
 * Checking a content url's various parameters
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
    safe: `/${config.content.base}`,
    status: 404,
  };

  // if there are no url parameters or type parameter, we're done checking this url
  if (!request.params || !request.params.hasOwnProperty('type')) {
    return next();
  }

  return utils.type(request).then(typ => {
    request.content.type = typ;

    return utils.id(request).then(() => {
      return utils.revision(request).then(() => {
        return next();
      });
    });
  }).catch(error => {
    err.message = error;

    return next(err);
  });
};

module.exports = {
  url,
};
