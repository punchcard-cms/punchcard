/**
 *  @fileoverview Database table utilities
 *
 *  @author  Scott Nath
 *  @author  Sam Richard
 *
 */
'use strict';

const Promise = require('bluebird');

const columnBuild = (table, field, knex) => {
  // If field is a timestamp, default to current datetime
  if (field.type === 'timestamp') {
    table[field.type](field.name).defaultTo(knex.fn.now());
  }
  else {
    table[field.type](field.name);
  }

  // If the field is an index, declare it
  if (field.index) {
    table.index(field.name);
  }
};

/*
  Create a table in the database

  ## TODO
  * if table exists, confirm schema & database align

  @param {function} knex - knex Configuration information
  @param {string} name - name of table to create
  @param {object} schema -

  @returns {string} activity-completed message
 */
const createTable = (knex, schema) => {
  return knex.schema.hasTable(schema.name).then(exists => {
    if (exists) {
      return Promise.filter(schema.fields, field => {
        return knex.schema.hasColumn(schema.name, field.name).then(has => {
          if (has) {
            return false;
          }

          return true;
        });
      }).then(missing => {
        return knex.schema.table(schema.name, table => {
          return missing.map(field => {
            columnBuild(table, field, knex);
          });
        });
      }).then(() => {
        return `table ${schema.name} EXISTS`; // TODO: tables exists, we need to check the schema and MAYBE update the table
      });
    }

    // Create tables

    return knex.schema.createTable(schema.name, table => {
      schema.fields.map(field => {
        columnBuild(table, field, knex);
      });

      return `table ${schema.name} created`;
    }).catch(e => {
      // Testing race condition sadness
      return e; // TODO: Figure out how we can fail the exists condition but still fail because the table already exists
    });
  });
};

module.exports = {
  create: createTable,
};
