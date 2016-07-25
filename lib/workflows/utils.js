'use strict';

const slugify = require('underscore.string/slugify');

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

  if (config.id !== slugify(config.id)) {
    return `${config.id} needs to be written in kebab case (e.g. ${slugify(config.id)})`;
  }

  if (!config.hasOwnProperty('steps')) {
    return 'A workflow must have steps';
  }

  if (!Array.isArray(config.steps)) {
    return 'Workflow steps must be an array';
  }

  config.steps.forEach(step => {
    if (!step.name) {
      return 'Step must have a name';
    }
    if (step.self && typeof step.self !== 'boolean') {
      return 'Whether a step is self-publish must be a boolean';
    }
  });

  return true;
};

module.exports = {
  check,
};
