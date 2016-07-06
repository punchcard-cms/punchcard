/**
 *  @fileoverview Workflow functions
 *
 *  @author  Scott Nath
 *
 */
'use strict';

const types = require('punchcard-content-types');
const workflow = require('./workflow');

/*
 * Returns a content model object with merged input plugin data
 *
 * @param {object} workflowModel  data on a workflow entry and the plugins it wants to use
 *
 * @returns {object} data on a workflow merged with input plugin data
 */
const modelMerged = (workflowModel) => {
  let workflowConfig;
  if (workflowModel) {
    workflowConfig = workflowModel;
  }
  else {
    workflowConfig = workflow;
  }

  // return the merged content type object
  return types([workflowConfig]);
};

module.exports = modelMerged;
