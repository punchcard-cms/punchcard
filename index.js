'use strict';

/**
 * @fileoverview Punchcard CMS Init
 */
const express = require('express');
const config = require('config');

const init = require('./lib/init');
const routes = require('./lib/routes');
const authenticated = require('./lib/auth/authenticated');

const application = express();
var myLogger = function (req, res, next) {
  console.log('LOGGED');
  next();
};
// Initialize the Database
const initApp = () => {
  return init(application).then(app => {
    //app.use(authenticated);
    return routes(app);
  }).catch(e => {
    throw new Error(e);
  });
};

/*
  @description run the server if and only if this file is being run directly
 */
if (!module.parent) {
  initApp().then(app => {
    app.listen(config.env.port, () => {
      // Mean to console.log out, so disabling
      console.log(`Server starting on ${config.env.url}`); // eslint-disable-line no-console
    });
  });
}

module.exports = initApp;
