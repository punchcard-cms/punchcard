'use strict';

const config = require('config');
const types = require('punchcard-content-types');
const db = require('../database');
const utils = require('../utils');

module.exports = (app) => {
  return types.raw().then(raw => {
    return db('all-types').insert({
      value: JSON.stringify(raw),
    }).then(() => {
      return types(raw);
    });
  }).then(cts => {
    app.set('name', config.site.name);
    app.set('content-types', cts);
    app.set('references', utils.references(cts));

    return app;
  });
};
