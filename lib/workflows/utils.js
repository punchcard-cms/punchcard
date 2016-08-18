'use strict';

const globalConfig = require('config');
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

  // map returns either true or a string; filter leaves us with just an array of strings
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
      return true;
    }

    return false;
  });

  // no errors are present
  if (!Array.isArray(test) || !test.length) {
    return true;
  }

  // return the first error
  return test[0];
};

/**
 * Get a single workflow from all workflows available
 *
 * @param {object} type - a content type object
 * @param {object} allFlows - an object of all workflows
 * @param {object} config - global configuration
 *
 * @returns {string|object} error message or a single workflow object
 */
const workflow = (type, allFlows) => {
  let wf;

  if (type.workflow) {
    wf = allFlows.find(flow => {
      return flow.id === type.workflow;
    });
  }
  else {
    wf = allFlows.find(flow => {
      return flow.id === globalConfig.workflows.default;
    });
  }

  if (wf === undefined || typeof wf !== 'object') {
    return globalConfig.workflows.messages.missing.replace('%type', type.name).replace('%workflow', type.workflow);
  }

  return wf;
};

module.exports = {
  check,
  workflow,
};
