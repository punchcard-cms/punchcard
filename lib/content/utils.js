'use strict';

const config = require('config');
const _ = require('lodash');
const isUUID = require('validator/lib/isUUID');


const check = {

  /**
   * Determine if an id is in uuid format; update session for error
   *
   * @param {object} req - HTTP Request
   *
   * @returns {boolean} false-not in uuid format / true-it is!
   */
  id: (req) => {
    if ((typeof req.params.id !== 'string') || (!isUUID(req.params.id))) {
      _.set(req.session, '404', {
        message: config.content.messages.format.id,
        safe: `/${config.content.base}`,
      });

      return false;
    }

    return true;
  },

  /**
   * Determine if a revision is a number; update session for error
   *
   * @param {object} req - HTTP Request
   *
   * @returns {boolean} false-not number / true-it is!
   */
  revision: (req) => {
    if (!Number.isInteger(parseInt(req.params.revision, 10))) {
      _.set(req.session, '404', {
        message: config.content.messages.format.revision.replace('%revision', req.params.revision),
        safe: `/${config.content.base}`,
      });

      return false;
    }

    return true;
  },

  /**
   * If type is false, update session for error
   *
   * @param {object} req - HTTP Request
   * @param {object} type - full content type object
   *
   * @returns {boolean} false-not true / true-it is!
   */
  type: (req, type) => {
    if (!type || (type === false) || (typeof type !== 'object') || !type.id || !type.name) {
      _.set(req.session, '404', {
        message: config.content.messages.missing.type.replace('%type', req.params.type),
        safe: `/${config.content.base}`,
      });

      return false;
    }

    return true;
  },
};

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

    return id(request).then(() => {
      return revision(request).then(() => {
        return next('route');
      });
    });
  }).catch(error => {
    err.message = error;
    next(err);

    return err;
  });
};

module.exports = {
  check,
  type,
  id,
  revision,
  url,
};
