'use strict';

const _ = require('lodash');
const path = require('path');

const defaultCfg = require('./default');

const config = _.cloneDeep(defaultCfg);

let knex = {};

if (process.env.CI === 'true') {
  knex = {
    dialect: 'pg',
    connection: {
      host: 'localhost',
      user: 'postgres',
      database: 'travis_ci_test',
    },
    debug: false,
    acquireConnectionTimeout: 1000,
  };
}

config.content.directory = path.join(__dirname, '../tests/fixtures/content-types');

module.exports = {
  content: config.content,
  knex,
  workflows: {
    default: 'self-publish',
    directory: path.join(__dirname, '../tests/fixtures/workflows'),
  },
};
