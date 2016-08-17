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
    const result = utils.references(cts);
    app.set('name', config.site.name);
    app.set('content-types', result.cts);
    app.set('references', result.references);

    return app;
  });
};
