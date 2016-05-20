'use strict';

const db = require('../database');

module.exports = (app) => {
  return db.init().then(() => {
    // Set Database for app
    app.set('database', db);

    return app;
  });
};
