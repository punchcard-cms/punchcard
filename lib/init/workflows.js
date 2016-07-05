'use strict';

const config = require('config');
const workflows = require('../workflows');

module.exports = (app) => {
  return workflows.raw().then(flows => {
    app.set('workflows', flows);

    return app;
  });
};
