'use strict';

/**
 * @fileoverview Punchcard CMS Init
 */
const express = require('express');
const config = require('config');
const _ = require('lodash');

const init = require('./lib/init');
const routes = require('./lib/routes');

const application = express();
const test = _.cloneDeep(config);
test.content.home.title = 'I win!';

// Initialize the Database
const initApp = () => {
  config.util.extendDeep(config, test);
  return init(application).then(app => {
    return routes(app);
  }).catch(e => {
    // Mean to console.log out, so disabling
    console.log(e.stack); // eslint-disable-line no-console
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
