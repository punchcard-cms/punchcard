/**
 *  @fileoverview Database table utilities
 *
 *  @author  Scott Nath
 *
 */
'use strict';
const schemaFunc = require('../schema');

/*
  Create a table in the database

  ## TODO
  * if table exists, confirm schema & database align

  @param {function} knex Configuration information
  @param {string} contentType content type path name

  @returns {string} activity-completed message
 */
const createTable = (knex, tableName) => {
  return knex.schema.hasTable(tableName)
    .then(exists => {
      if (exists) {
        return `table ${tableName} EXISTS`; // TODO: tables exists, we need to check the schema and MAYBE update the table
      }

      // get the table's schema

      return schemaFunc.getContentTypeSchema(tableName)
        .then(schema => {
          return knex.schema.createTable(tableName, table => {
            schema.forEach(field => {
              table[field.type](field.name);
            });
          })
          .then(() => {
            return `table ${tableName} created`;
          });
        });
    });
};

module.exports = {
  createTable,
};
