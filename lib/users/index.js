'use strict';
const config = require('config');
const contentTypes = require('punchcard-content-types');
const userRoutes = require('./routes');
const fs = require('fs');
const yaml = require('js-yaml');
const knex = require('knex')(config.knex);

/*
  Checks for the existence of a `users` table

  ## TODO
  * This will change (or go away) when we have a table-creation process

  @returns {string} process message
 */
const checkUserTable = () => {
  return knex.schema.hasTable('users')
    .then(exists => {
      if (exists) {
        return 'table "users" EXISTS';
      }

      return knex.schema.createTable('users', table => {
        table.uuid('id');
        table.string('email').unique();
        table.string('password');
        table.string('level');
        table.jsonb('contentAccess');
        table.string('created');
      })
      .then(() => {
        return 'table "users" CREATED';
      });
    });
};

/*
 * Returns a content model object with merged input plugin data
 *
 * @param {object} userContentType  data on a content type and the plugins it wants to use
 *
 * @returns {object} data on a content type merged with input plugin data
 */
const userContentTypeMerged = (userContentType) => {
  let userConfig;
  if (userContentType) {
    userConfig = userContentType;
  }
  else {
    userConfig = yaml.safeLoad(fs.readFileSync(config.users.configFile, 'utf8'));
  }

  // return the merged content type object
  return contentTypes([userConfig]);
};

module.exports.userContentType = userContentTypeMerged;
module.exports.userRoutes = userRoutes;
module.exports.checkUserTable = checkUserTable;
