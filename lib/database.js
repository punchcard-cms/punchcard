'use strict';

const Promise = require('bluebird');
const types = require('punchcard-content-types');
const config = require('config');

const tables = require('./database/tables');
const schemas = require('./database/schemas');
const utils = require('./utils');

const knex = require('knex');

const database = knex(config.knex);

/**
 * Initialize the database with provided schemas
 *
 * @returns {promise} - Configured knex object for use with the database
 */
const init = () => {
  return types(null, config).then(cts => {
    // Get Content Type fields
    const contentSchema = utils.singleItem('name', 'content', schemas).fields;

    // Filter out Content from Schemas
    const schemata = schemas.filter(schema => {
      if (schema.name === 'content') {
        return false;
      }

      return true;
    }).concat(cts.map(type => {
      // Add Content schemas back to all schemata
      return {
        name: `content-type--${type.id}`,
        fields: contentSchema,
      };
    }));

    // Loop over all schema and create database tables
    return Promise.map(schemata, schema => {
      return tables.create(database, schema);
    });
  }).then(() => {
    // Return the database object if a user would like to start working with it
    return database;
  }).catch(e => {
    throw new Error(e);
  });
};

// return Promise.map(schemas, schema => {

//   }

module.exports = database;
module.exports.init = init;
