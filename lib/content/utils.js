'use strict';

const config = require('config');
const _ = require('lodash');
const isUUID = require('validator/lib/isUUID');

const utils = require('../utils');
const workflows = require('../workflows');

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

  const exists = utils.singleItem('id', typ.toLowerCase(), allTypes);

  if (!exists || (exists === false) || (typeof exists !== 'object') || !exists.id || !exists.name) {
    return config.content.messages.missing.type.replace('%type', req.params.type.toString());
  }

  return exists;

}

/**
 * Determine if an id is in uuid format
 *
 * @param {string} id - content type id
 *
 * @returns {boolean|string} true-id is string and in uuid format / string = error message
 */
const id = (ident) => {
  if (ident === '' || typeof ident !== 'string' || !isUUID(ident)) {
    return config.content.messages.format.id;
  }

  return true;
}

/**
 * Determine if a revision is a number
 *
 * @param {object} req - HTTP Request
 *
 * @returns {boolean} false-not number / true-it is!
 */
const revision = (rev) => {
  if (rev === '' || !Number.isInteger(parseInt(rev, 10))) {
    return config.content.messages.format.revision;
  }

  return true;
}

/**
 * Checking that what is in a content url matches what's in the system
 * @param {object} req - HTTP Request
 * @param {object} allTypes - all content types available to the CMS
 * @param {object} allFlows - all workflows available to the CMS
 *
 * @returns {object|string} object of data needed for content manipulation | string with an error
 */
const url = (req, allTypes, allFlows) => {
  const typ = type(req, allTypes);

  // type did not exist in allTypes
  if (typeof typ === 'string') {
    return typ;
  }
console.log('FIRST');
  console.log(workflows);
  const workflow = workflows.workflow(typ, allFlows);
  console.log(workflow);

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

}

module.exports = {
  check: {
    type,
    id,
    revision,
    url,
  },
};
