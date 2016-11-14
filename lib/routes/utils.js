'use strict';

const config = require('config');
const _ = require('lodash');
const isUUID = require('validator/lib/isUUID');

/**
 * Add identifier to each piece of content in an array of rows.
 * @param  {array} rows array of rows of content as they are saved in the db
 * @param  {object} type content type configuration post-merging with input-plugins
 *
 * @returns {array} rows with identifier added for each row
 */
const identifier = (rows, type) => {
  const attr = _.find(type.attributes, { 'id': type.identifier });
  const input = Object.keys(attr.inputs)[0];

  return rows.map(rw => {
    const row = rw;
    const value = _.get(row, `value[${type.identifier}][${input}].value`, '');

    if (value !== '') {
      row.identifier = value;
    }
    else {
      row.identifier = `Revision: ${row.revision}`;
    }

    return row;
  });
};

/**
 * Determine if the variable is either a uuid or matches a set of actions
 *
 * @param {string} action - Variable to test
 * @param {string} section - route section name
 *
 * @returns {promise} reject with error message; resolve true
 */
const actions = (action, section) => {
  const route = section || 'content';
  const acts = Object.keys(config[route].actions);
  const message = config[route].messages.format.id || 'ID must be in UUID format';

  return new Promise((res, rej) => {
    // no variable in the request
    if (!action) {
      res(true);
    }

    // check if variable matches any of the possible actions
    if (acts && Array.isArray(acts)) {
      if (acts.indexOf(action) !== -1) {
        res(true);
      }
    }

    if (typeof action !== 'string' || !isUUID(action)) {
      rej(message);
    }

    res(true);
  });
};

module.exports = {
  identifier,
  actions,
};
