/**
 *  @fileoverview User functions
 *
 *  @author  Scott Nath
 *
 */
'use strict';

const types = require('punchcard-content-types');
const users = require('./users');

/*
 * Returns a content model object with merged input plugin data
 *
 * @param {object} userModel  data on a content type and the plugins it wants to use
 *
 * @returns {object} data on a content type merged with input plugin data
 */
const modelMerged = (userModel) => {
  let userConfig;
  if (userModel) {
    userConfig = userModel;
  }
  else {
    userConfig = users;
  }

  // return the merged content type object
  return types([userConfig]);
};

module.exports = modelMerged;
