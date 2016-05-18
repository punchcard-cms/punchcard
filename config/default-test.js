'use strict';

const path = require('path');

module.exports = {
  contentTypes: {
    directory: path.join(__dirname, '..', 'content-types'),
  },
  knex: {
    dialect: 'sqlite3',
    connection: {
      filename: ':memory:',
    },
    debug: false,
    acquireConnectionTimeout: 1000,
  },
};
