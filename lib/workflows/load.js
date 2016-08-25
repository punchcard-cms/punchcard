'use strict';

const dir = require('node-dir');
const yaml = require('js-yaml');
const globalConfig = require('config');
const path = require('path');
const utils = require('./utils');

/**
 * Gets all Workflows
 *
 * @param {string} wfpath path to workflow directory
 *
 * @returns {Promise} - An {Array} containing {Object} for each workflow, including `name` {String}, `id` name {String}, and steps {Object} loaded from YAML config file
 */
const load = (wfpath) => {
  const workflows = [];
  const ids = [];
  let workflowsPath = path.join(process.cwd(), 'workflows');

  if (globalConfig.hasOwnProperty('workflows')) {
    if (globalConfig.workflows.hasOwnProperty('directory')) {
      workflowsPath = globalConfig.workflows.directory;
    }
  }

  if (wfpath) {
    workflowsPath = wfpath;
  }

  return new Promise((resolve, reject) => {
    dir.readFiles(workflowsPath, {
      match: /.yml$/,
      exclude: /^\./,
      recursive: false,
    }, (err, content, next) => {
      if (err) {
        reject(err);
      }

      const config = yaml.safeLoad(content);

      if (utils.check(config) !== true) {
        reject(new Error(utils.check(config)));
      }

      if (ids.indexOf(config.id) === -1) {
        ids.push(config.id);
        workflows.push(config);
      }
      else {
        reject(new Error(`Workflow ${config.id} is duplicated!`));
      }

      next();
    }, (err) => {
      if (err) {
        reject(err);
      }
      resolve(workflows);
    });
  });
};

module.exports = load;
