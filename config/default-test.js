'use strict';

const path = require('path');

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

module.exports = {
  contentTypes: {
    directory: path.join(__dirname, '..', 'content-types'),
  },
  knex,
  workflows: {
    default: 'self-publish',
    directory: path.join(__dirname, '..', 'tests/fixtures/workflows'),
  },
};
