/**
 *  @fileoverview Users model
 *
 *  @author  Scott Nath
 *
 */
'use strict';

const types = require('punchcard-content-types');
const config = require('config');

/**
 * Gets user roles from configuration
 *
 * @return {array}      [description]
 */
const roles = config.roles.config.map(role => {
  return {
    label: role.name,
    value: role.id,
  };
});

/**
 * Users data entry structure
 *
 * @returns {object} - content structure to match requirements of punchcard-content-types
 */
const structure = {
  name: 'Users',
  description: 'An individual user',
  id: 'users',
  identifier: 'email',
  attributes: [
    {
      type: 'email',
      id: 'email',
      name: 'Email',
      required: 'save',
      description: 'Email address for your account',
    },
    {
      type: 'password',
      id: 'password',
      name: 'Password',
      description: 'CAUTION: Adding a password here will change the user\'s password.',
    },
    {
      type: 'select',
      id: 'role',
      name: 'Authorization role',
      description: 'Select authorization level',
      inputs: {
        select: {
          options: roles,
        },
      },
    },
  ],
};

/*
 * Returns a content model object with merged input plugin data
 *
 * @param {object} cfg  data on users and the plugins it wants to use
 *
 * @returns {object} data on users merged with input plugin data
 */
const model = (cfg) => {
  let usercfg;
  if (cfg) {
    usercfg = cfg;
  }
  else {
    usercfg = structure;
  }

  // return the merged content type object
  return types([usercfg], config);
};

module.exports = model;
module.exports.roles = roles;
module.exports.structure = structure;
