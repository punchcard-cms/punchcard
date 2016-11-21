'use strict';

const config = require('config');

const utils = require('./utils');
const rutils = require('../../routes/utils');
const workflows = require('../../workflows/utils');


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
  let action;

  // if there are no url parameters or type parameter, we're done checking this url
  if (!request.hasOwnProperty('params') || !request.params.hasOwnProperty('type')) {
    return new Promise((resolve) => {
      resolve(next);
    });
  }

  // get the action route parameter
  if (request.params.hasOwnProperty('id')) {
    action = request.params.id;
  }
  else {
    action = '';
  }

  return utils.type(request).then(typ => {
    request.content.type = typ;

    return workflows.workflow(request.content.type, request.content.workflows).then(workflow => {
      request.content.workflow = workflow;

      return rutils.actions(action).then(() => {
        return utils.revision(request).then(() => {
          return next();
        });
      });
    });
  }).catch(error => {
    err.message = error;

    return next(err);
  });
};

module.exports = url;
