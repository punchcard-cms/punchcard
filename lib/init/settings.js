'use strict';

const config = require('config');
const types = require('punchcard-content-types');
const db = require('../database');

module.exports = (app) => {
  return db('all-types').max('version').then(result => {
    return db.select().table('all-types').where('version', result[0].max);
  }).then(raw => {
    return types(raw.value);
  }).then(cts => {
    app.set('name', config.site.name);
    app.set('contnet-types', cts);

    return app;
  });
};
