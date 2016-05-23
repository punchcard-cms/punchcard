'use strict';

/**
 * @fileoverview Punchcard CMS Init
 */
const express = require('express');
const config = require('config');

const init = require('./lib/init');
const routes = require('./lib/routes');

const application = express();

// Initialize the Database
const initApp = () => {
  return init(application).then(app => {
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
      console.log(`Server starting on ${config.env.url}`);
    });
  });
}

module.exports = initApp;
