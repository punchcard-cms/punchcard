/**
 *  @fileoverview Workflow functions
 *
 *  @author  Scott Nath
 *
 */
'use strict';

const types = require('punchcard-content-types');

/**
 * Workflow data entry structure
 *
 * @returns {object} - content structure to match requirements of punchcard-content-types
 */
const structure = {
  name: 'Workflow',
  description: 'A workflow entry',
  id: 'workflow',
  attributes: [
    {
      type: 'textarea',
      id: 'comment',
      name: 'Comment',
      required: 'save',
      description: 'Comment required to continue workflow',
    },
    {
      type: 'select',
      id: 'action',
      name: 'Action',
      required: 'save',
      description: 'Please choose to approve or reject this content.',
      inputs: {
        select: {
          options: [
            { label: 'Select Action',
              value: '',
            },
            { label: 'Approve',
              value: 'approve',
            },
            { label: 'Reject',
              value: 'reject',
            },
          ],
        },
      },
    },
  ],
};

/*
 * Returns a content model object with merged input plugin data
 *
 * @param {object} workflowModel  data on a workflow entry and the plugins it wants to use
 *
 * @returns {object} data on a workflow merged with input plugin data
 */
const model = (workflowModel) => {
  let workflowConfig;
  if (workflowModel) {
    workflowConfig = workflowModel;
  }
  else {
    workflowConfig = structure;
  }

  // return the merged content type object
  return types([workflowConfig]);
};

module.exports = model;
module.exports.structure = structure;
