/**
 *  @fileoverview Creating a request object fixture
 *
 *  @author  Scott Nath
 *
 */
'use strict';

const mocks = require('node-mocks-http');
const _ = require('lodash');

let request;

// get default request object
request = mocks.createRequest();

/**
 * appget
 *
 * @param {string} find - value to search for
 *
 * @returns {varies} whatever the search gives back
 */
const appget = (find) => {
  // here to mimic application functions until this pr is complete: https://github.com/howardabrams/node-mocks-http/pull/107
  return request.app[find];
};

/**
 * appset
 *
 * @param {string} find - value to search for
 * @param {varies} changed - new value to replace with
 */
const appset = (find, changed) => {
  // here to mimic application functions until this pr is complete: https://github.com/howardabrams/node-mocks-http/pull/107
  request.app[find] = changed;
};

/**
 * Flesh out the request object and merge with configuration
 * @param  {object} opt - changes needed by the requesting module
 *
 * @returns {object} - final request object
 */
const configure = (opt) => {
  const options = _.cloneDeep(opt);

  // add some app funcitonality
  request.app = {
    'get': appget,
    'set': appset,
  };

  // session needs an object
  request.session = {};

  // merge with any options needed
  request = _.merge({}, request, options);

  return request;
};

module.exports = configure;
