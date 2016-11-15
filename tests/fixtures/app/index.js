/**
 *  @fileoverview Application mocking
 *
 *  @author  Scott Nath
 *
 */
'use strict';

const request = require('./request');

/**
 * Next
 *
 * @param {object} value object send to next
 *
 * @returns {object} whatever the function received
 */
const next = (value) => {
  return value;
};

module.exports = {
  next,
  request,
};
