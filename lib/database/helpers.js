'use strict';

/**
 *  @fileoverview Database helper functions
 *
 *  @author  Snugug
 *
 */
const helpers = {};

helpers.timestamp = () => {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
};

module.exports = helpers;
