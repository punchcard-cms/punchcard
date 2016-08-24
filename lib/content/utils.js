'use strict';

const config = require('config');
const isUUID = require('validator/lib/isUUID');

const workflows = require('../workflows/utils');

/**
 * Grab type from all content types in system
 *
 * @param {object} req - HTTP Request
 *
 * @returns {object|string} content-type object / string = error message
 */
const type = (req) => {
  const typ = req.params.type.toString();

  if (!typ || typ === '') {
    return config.content.messages.missing.type.replace('%type', '(no type given)');
  }

  const exists = req.content.types.find(tp => {
    return tp.id === typ.toLowerCase();
  });

  if (!exists || (exists === false) || (typeof exists !== 'object') || !exists.id || !exists.name) {
    return config.content.messages.missing.type.replace('%type', typ);
  }

  return exists;
};

/**
 * Determine if an id is in uuid format
 *
 * @param {string} ident - content type id
 *
 * @returns {boolean|string} true-id is string and in uuid format / string = error message
 */
const id = (ident) => {
  // this can be the add, approve, or save action instead of a uuid
  if (ident === config.content.actions.add || ident === config.content.actions.save || ident === config.content.actions.approve) {
    return true;
  }

  if (ident === '' || typeof ident !== 'string' || !isUUID(ident)) {
    return config.content.messages.format.id;
  }

  return true;
};

/**
 * Determine if a revision is a number
 *
 * @param {number} rev - revision number
 *
 * @returns {boolean} false-not number / true-it is!
 */
const revision = (rev) => {
  if (rev === '' || !Number.isInteger(parseInt(rev, 10))) {
    return config.content.messages.format.revision;
  }

  return true;
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

  if (Object.keys(request.params).length < 1) {
    return next('route');
  }

  request.content.type = type(request);

  // type did not exist in CMS
  if (typeof request.content.type === 'string') {
    err.message = request.content.type;

    return next(err);
  }

  request.content.workflow = workflows.workflow(request.content.type, request.content.workflows);

  // workflow did not exist in request.workflows
  if (typeof request.content.workflow === 'string') {
    err.message = request.content.workflow;
    err.safe = `/${config.content.base}`;

    return next(err);
  }

  // url has an id in it
  if (request.params.id) {
    if (typeof id(request.params.id) === 'string') {
      err.message = id(request.params.id);
      err.safe = `/${config.content.base}/${request.params.type}`;

      return next(err);
    }
  }

  // url has a revision in it
  if (request.params.revision) {
    if (typeof revision(request.params.revision) === 'string') {
      err.message = revision(request.params.revision);
      err.safe = `/${config.content.base}/${request.params.type}/${request.params.id}`;

      return next(err);
    }
  }

  return next('route');
};

module.exports = {
  type,
  id,
  revision,
  url,
};
