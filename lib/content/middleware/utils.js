'use strict';

const config = require('config');
const isUUID = require('validator/lib/isUUID');

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

    if ((typeof exists !== 'object') || !exists.id || !exists.name) {
      rej(config.content.messages.missing.type.replace('%type', typ));
    }

    res(exists);
  });
};

/**
 * Determine if the id-level url parameter is a piece of content's id or an content-type level action
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

module.exports = {
  type,
  id,
  revision,
};
