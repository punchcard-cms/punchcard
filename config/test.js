'use strict';

const path = require('path');

const defaultCfg = require('./default');

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

defaultCfg.content.directory = path.join(__dirname, '../tests/fixtures/content-types/good');
defaultCfg.workflows.directory = path.join(__dirname, '../tests/fixtures/workflows/good');

module.exports = {
  content: defaultCfg.content,
  knex,
  workflows: defaultCfg.workflows,
};
