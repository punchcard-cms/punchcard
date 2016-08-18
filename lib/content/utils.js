'use strict';

const config = require('config');
const isUUID = require('validator/lib/isUUID');

const workflows = require('../workflows/utils');

/**
 * Grab type from all content types in system
 *
 * @param {object} req - HTTP Request
 * @param {object} allTypes - all content types
 *
 * @returns {object|string} content-type object / string = error message
 */
const type = (req, allTypes) => {
  const typ = req.params.type.toString();

  if (!typ || typ === '') {
    return config.content.messages.missing.type.replace('%type', '(no type given)');
  }

  const exists = allTypes.find(tp => {
    return tp.id === typ.toLowerCase();
  });

  if (!exists || (exists === false) || (typeof exists !== 'object') || !exists.id || !exists.name) {
    return config.content.messages.missing.type.replace('%type', req.params.type.toString());
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

/*
 * @typedef routeDetails
 * @type object
 *
 * @property {object} type - Content type configuration, after merged with input plugins
 * @property {object} workflow - workflow configuration
 * @property {string} id - id of a piece of content
 * @property {string} revision - revision number for a revision of a piece of content
 */

/**
 * Checking that what is in a content url matches what's in the system
 * @param {object} req - HTTP Request
 * @param {object} allTypes - all content types available to the CMS
 * @param {object} allFlows - all workflows available to the CMS
 *
 * @returns {routeDetails|string} object of data gleaned from a route | string with an error
 */
const url = (req, allTypes, allFlows) => {
  const typ = type(req, allTypes);

  // type did not exist in allTypes
  if (typeof typ === 'string') {
    return typ;
  }

  const workflow = workflows.workflow(typ, allFlows);

  // workflow did not exist in allFlows
  if (typeof workflow === 'string') {
    return workflow;
  }

  // url has an id in it
  if (req.params.id) {
    if (typeof id(req.params.id) === 'string') {
      return id(req.params.id);
    }
  }

  // url has a revision in it
  if (req.params.revision) {
    if (typeof revision(req.params.revision) === 'string') {
      return revision(req.params.revision);
    }
  }

  return {
    type: typ,
    workflow,
    id: req.params.id,
    revision: req.params.revision,
  };
};

module.exports = {
  check: {
    type,
    id,
    revision,
    url,
  },
};
