'use strict';

const dir = require('node-dir');
const yaml = require('js-yaml');
const kebab = require('lodash/kebabCase');
const globalConfig = require('config');
const path = require('path');

/**
 * Gets all Workflows
 *
 * @returns {Promise} - An {Array} containing {Object} for each workflow, including `name` {string}, `id` {string}, and full config {object} loaded from YAML config file
 */
const load = () => {
  const workflows = [];
  const ids = [];
  let workflowsPath = path.join(process.cwd(), 'workflows');

  if (globalConfig.hasOwnProperty('workflows')) {
    if (globalConfig.content.hasOwnProperty('workflows')) {
      workflowsPath = globalConfig.content.directory;
    }
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

      if (!config.hasOwnProperty('name')) {
        reject(new Error('Workflows require a name'));
      }

      if (!config.hasOwnProperty('id')) {
        reject(new Error('Workflows require an id'));
      }

      if (config.id !== kebab(config.id)) {
        reject(new Error(`${config.id} needs to be written in kebab case (e.g. ${kebab(config.id)}`));
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
