'use strict';

const schedule = require('../schedule');

module.exports = app => {
  return schedule.bootstrap(app.get('applications')).then(() => {
    return app;
  });
};
