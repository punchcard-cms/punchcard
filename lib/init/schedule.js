'use strict';

const schedule = require('../schedule');

module.exports = app => {
  return schedule.bootstrap(app.get('applications-apps')).then(() => {
    return app;
  });
};
