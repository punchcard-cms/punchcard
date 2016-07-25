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

module.exports = {
  check,
};
