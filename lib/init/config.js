'use strict';

const config = require('config');
const _ = require('lodash');
const path = require('path');

const local = path.join(__dirname, '../../input-plugins');

module.exports = (application) => {
  return new Promise((res, rej) => {
    const app = application;

    // grab plugins dir from config
    let plugins = _.get(config, 'content.plugins.directory', []);

    // convert string to array
    if (typeof plugins === 'string') {
      plugins = [plugins];
    }

    // must be string or array
    if (!Array.isArray(plugins)) {
      rej('Plugin directory configuration must be string or an array');
    }

    // push local directory if it does not exist
    if (plugins.indexOf(local) === -1) {
      plugins.push(local);
    }

    const configuration = _.set(config, 'content.plugins.directory', plugins);

    // use node-config function to add Punchcard plugin directory
    config.util.extendDeep(config, configuration);

    res(app);
  });
};
