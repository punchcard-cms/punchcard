/**
 *  @fileoverview Applications model
 *
 *  @author  Scott Nath
 *
 */
'use strict';

const types = require('punchcard-content-types');
const config = require('config');

/**
 * Applications data entry structure
 *
 * @returns {object} - content structure to match requirements of punchcard-content-types
 */
const structure = {
  name: 'Applications',
  description: 'Contains webhook applications',
  id: 'applications',
  identifier: 'name',
  attributes: [
    {
      type: 'text',
      id: 'name',
      name: 'Name',
      required: 'save',
      description: 'Application name',
      inputs: {
        text: {
          placeholder: 'Application name'
        }
      }
    },
    {
      type: 'text',
      id: 'live-endpoint',
      name: 'Live Endpoint',
      description: 'endpoint to call when content goes live',
    },
    {
      type: 'text',
      id: 'updated-endpoint',
      name: 'Updated Endpoint',
      description: 'endpoint to call when live content gets updated',
    },
    {
      type: 'text',
      id: 'sunset-endpoint',
      name: 'Sunset Endpoint',
      description: 'endpoint to call when live content gets sunsetted',
    },
    {
      type: 'text',
      id: 'client-id',
      name: 'Client ID',
      description: 'do not edit',
    },
    {
      type: 'text',
      id: 'client-secret',
      name: 'Client Secret',
      description: 'do not edit',
    },
  ],
};

/*
 * Returns a content model object with merged input plugin data
 *
 * @param {object} applicationsModel  data on an application and the plugins it wants to use
 *
 * @returns {object} data on an application merged with input plugin data
 */
const model = (applicationsModel) => {
  let applicationConfig;
  if (applicationsModel) {
    applicationConfig = applicationsModel;
  }
  else {
    applicationConfig = structure;
  }

  // return the merged content type object
  return types([applicationConfig], config);
};

module.exports = model;
module.exports.structure = structure;
