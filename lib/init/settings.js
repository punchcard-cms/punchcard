'use strict';

const config = require('config');
const _ = require('lodash');
const types = require('punchcard-content-types');

const applications = require('../applications/init');
const database = require('../database');
const utils = require('../utils');

module.exports = (app) => {
  return types.raw(config).then(raw => {
    return database('all-types').insert({
      value: JSON.stringify(raw),
    }).then(() => {
      return types(raw, config);
    });
  }).then(cts => {
    const result = utils.references(cts);
    app.set('name', config.site.name);
    app.set('content-types', result.cts);
    app.set('references', result.references);

    return applications().then(results => {
      app.set('applications-merged', results.merged);
      app.set('applications-apps', results.apps);

      return app;
    });
  });
};
