'use strict';

const schedule = require('../schedule');

module.exports = app => {
  return schedule.bootstrap().then(() => {
    return app;
  });
};
