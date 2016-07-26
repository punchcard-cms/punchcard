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

  if (config.steps.length < 1) {
    return 'Workflow must have at least one step';
  }

  const test = config.steps.map(step => {
    if (!step.name || step.name === '') {
      return 'Step must have a name';
    }
    if (typeof step.name !== 'string') {
      return 'Step name must be a string';
    }
    if (step.self && typeof step.self !== 'boolean') {
      return 'Self-publish must be a boolean';
    }

    return true;
  }).filter((res) => {
    if (res !== true) {
      return res;
    }

    return false;
  });

  if (!Array.isArray(test) || !test.length) {
    return true;
  }

  return test[0];
};

module.exports = {
  check,
};
