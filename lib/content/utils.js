'use strict';

const config = require('config');
const isUUID = require('validator/lib/isUUID');

const workflows = require('../workflows/utils');

/**
 * Grab type from all content types in system
 *
 * @param {object} req - Express Request Object
 *
 * @returns {promise} reject with error message; resolve with single content-type object
 */
const type = (req) => {
  return new Promise((res, rej) => {
    const typ = req.params.type.toString();

    if (!typ || typ === '') {
      rej(config.content.messages.missing.type.replace('%type', '(no type given)'));
    }

    const exists = req.content.types.find(tp => {
      return tp.id === typ.toLowerCase();
    });

    if (!exists || (exists === false) || (typeof exists !== 'object') || !exists.id || !exists.name) {
      rej(config.content.messages.missing.type.replace('%type', typ));
    }

    res(exists);
  });
};

/**
 * Determine if an id is in uuid format
 *
 * @param {object} req - Express Request Object
 *
 * @returns {promise} reject with error message; resolve true
 */
const id = (req) => {
  return new Promise((res, rej) => {
    // no id in the request
    if (!req.params.hasOwnProperty('id')) {
      res(true);
    }

    // this can be the add, approve, or save action instead of a uuid
    if (req.params.id === config.content.actions.add || req.params.id === config.content.actions.save || req.params.id === config.content.actions.approve) {
      res(true);
    }

    if (req.params.id === '' || typeof req.params.id !== 'string' || !isUUID(req.params.id)) {
      rej(config.content.messages.format.id);
    }

    res(true);
  });
};

/**
 * Determine if a revision is a number
 *
 * @param {object} req - Express Request Object
 *
 * @returns {promise} reject with error message; resolve true
 */
const revision = (req) => {
  return new Promise((res, rej) => {
    // no revision in the request
    if (!req.params.hasOwnProperty('revision')) {
      res(true);
    }

    if (req.params.revision === '' || !Number.isInteger(parseInt(req.params.revision, 10))) {
      rej(config.content.messages.format.revision);
    }

    res(true);
  });
};

/**
 * Checking that what is in a content url matches what's in the system
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

  return type(request).then(typ => {
    request.content.type = typ;

    return workflows.workflow(request.content.type, request.content.workflows).then(workflow => {
      request.content.workflow = workflow;

      return id(request).then(() => {
        return revision(request).then(() => {
          return next('route');
        });
      });
    });
  }).catch(error => {
    err.message = error;
    next(err);

    return err;
  });

  // // ONEtype did not exist in CMS
  // if (typeof request.content.type === 'string') {
  //   err.message = request.content.type;

  //   return next(err);
  // }

  // // TWOworkflow did not exist in request.workflows
  // if (typeof request.content.workflow === 'string') {
  //   err.message = request.content.workflow;
  //   err.safe = `/${config.content.base}`;

  //   return next(err);
  // }

  // // THREEurl has an id in it
  // if (request.params.id) {
  //   if (typeof id(request.params.id) === 'string') {
  //     err.message = id(request.params.id);
  //     err.safe = `/${config.content.base}/${request.params.type}`;

  //     return next(err);
  //   }
  // }

  // // url has a revision in it
  // if (request.params.revision) {
  //   if (typeof revision(request.params.revision) === 'string') {
  //     err.message = revision(request.params.revision);
  //     err.safe = `/${config.content.base}/${request.params.type}/${request.params.id}`;

  //     return next(err);
  //   }
  // }

  // return next('route');
};

module.exports = {
  type,
  id,
  revision,
  url,
};
