'use strict';

const dir = require('node-dir');
const yaml = require('js-yaml');
const kebab = require('lodash/kebabCase');
const globalConfig = require('config');
const path = require('path');

/*
 * Checks the configuration of a workflow
 *
 * @param {object} config workflow config
 *
 * @return {true|string} either true or an error string
 */
const check = (config) => {
  if (!config.hasOwnProperty('name')) {
    return 'Workflows require a name';
  }

  if (typeof config.name !== 'string') {
    return 'Workflows name must be string';
  }

  if (!config.hasOwnProperty('id')) {
    return 'Workflows require an id';
  }

  if (config.id !== kebab(config.id)) {
    return `${config.id} needs to be written in kebab case (e.g. ${kebab(config.id)})`;
  }

  if (!config.hasOwnProperty('steps')) {
    return 'A workflow must have steps';
  }

  if (!Array.isArray(config.steps)) {
    return 'Workflow steps must be an array';
  }

  return true;
};

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
    }, (err, content, next) => {
      if (err) {
        reject(err);
      }

      const config = yaml.safeLoad(content);

      if (check(config) !== true) {
        reject(new Error(check(config)));
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
module.exports.check = check;
