'use strict';

const config = require('config');
const types = require('punchcard-content-types');

const applications = require('../applications');
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

    return applications.model();
  }).then(merged => {
    app.set('applications-merged', merged[0]);

    return database('applications').select('*').orderBy('name', 'DESC').then(rows => {
      return rows.map(rw => {
        const row = rw;
        row.client = {
          id: row['client-id'],
          secret: row['client-secret'],
        };

        return row;
      });
    });
  }).then(apps => {
    app.set('applications', apps);

    return app;
  });
};
