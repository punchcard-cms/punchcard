'use strict';

const config = require('config');

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

    if (typeof typ === 'undefined' || typ === '') {
      rej(config.content.messages.missing.type.replace('%type', '(no type given)'));
    }

    const exists = req.content.types.find(tp => {
      return tp.id === typ.toLowerCase();
    });

    if ((typeof exists !== 'object') || !exists.hasOwnProperty('id') || !exists.hasOwnProperty('name')) {
      rej(config.content.messages.missing.type.replace('%type', typ));
    }

    res(exists);
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

    if (!Number.isInteger(parseInt(req.params.revision, 10))) {
      rej(config.content.messages.format.revision);
    }

    res(true);
  });
};

module.exports = {
  type,
  revision,
};
