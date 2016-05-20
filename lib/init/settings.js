'use strict';

const config = require('config');
const types = require('punchcard-content-types');
const db = require('../database');

module.exports = (app) => {
  return types.raw().then(raw => {
    return db('all-types').insert({
      value: JSON.stringify(raw),
    }).then(() => {
      return types(raw);
    });
  }).then(cts => {
    app.set('name', config.site.name);
    app.set('contnet-types', cts);

    return app;
  });
};
