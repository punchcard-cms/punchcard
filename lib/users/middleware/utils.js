'use strict';

const config = require('config');
const isUUID = require('validator/lib/isUUID');

/**
 * Determine if the id-level url parameter is a user's id or an administration action
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

    // this can be the add or save action instead of a uuid
    if (req.params.id === config.users.actions.add || req.params.id === config.users.actions.save) {
      res(true);
    }

    if (typeof req.params.id !== 'string' || !isUUID(req.params.id)) {
      rej(config.users.messages.errors.uuid);
    }

    res(true);
  });
};

module.exports = {
  id,
};
