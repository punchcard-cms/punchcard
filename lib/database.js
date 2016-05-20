'use strict';

const Promise = require('bluebird');
const types = require('punchcard-content-types');
const config = require('config');

const tables = require('./database/tables');
const schemas = require('./database/schemas');
const utils = require('./utils');

const knex = require('knex');

const database = knex(config.knex);

const init = () => {
  return types().then(cts => {
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
    // Get raw content types
    return types.raw();
  }).then(raw => {
    // Store versioned content types in DB
    return database('all-types').insert({
      value: JSON.stringify(raw),
    });
  }).catch(e => {
    throw new Error(e);
  });
};

// return Promise.map(schemas, schema => {

//   }

module.exports = database;
module.exports.init = init;
