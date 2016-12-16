'use strict';

const config = require('config');
const types = require('punchcard-content-types');

const applications = require('../applications/init');
const users = require('../users/model');
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

    return applications();
  }).then(apps => {
    app.set('applications-merged', apps.merged);
    app.set('applications-apps', apps.apps);

    return users();
  }).then(merged => {
    app.set('users-model', merged[0]);

    return users.create();
  }).then(create => {
    app.set('users-create-model', create[0]);

    return app;
  });
};
