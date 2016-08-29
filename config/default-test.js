'use strict';

const _ = require('lodash');
const path = require('path');

const defaultCfg = require('./default');

const content = _.cloneDeep(defaultCfg.content);

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
    acquireConnectionTimeout: 2000,
  };
}

content.directory = path.join(__dirname, '../tests/fixtures/content-types/good');

module.exports = {
  content,
  knex,
  workflows: {
    default: 'self-publish',
    directory: path.join(__dirname, '../tests/fixtures/workflows/good'),
  },
};
