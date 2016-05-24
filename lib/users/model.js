/**
 *  @fileoverview User functions
 *
 *  @author  Scott Nath
 *
 */
'use strict';

const config = require('config');
const contentTypes = require('punchcard-content-types');
const fs = require('fs');
const yaml = require('js-yaml');

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
    userConfig = yaml.safeLoad(fs.readFileSync(config.users.configFile, 'utf8'));
  }

  // return the merged content type object
  return contentTypes([userConfig]);
};

module.exports = modelMerged;
