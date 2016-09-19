'use strict';

const validation = require('../_utils').validation;

/**
 * Mock of `applications` merged-content-type object
 * @type {Array}
 */
module.exports = {
  name: 'Applications',
  description: 'Contains webhook applications',
  id: 'applications',
  identifier: 'name',
  attributes: [
    {
      name: 'Name',
      description: 'Application name',
      validation: {
        validation,
      },
      inputs: {
        text: {
          validation: {
            function: 'validation',
            on: 'blur',
          },
          label: 'Name',
          placeholder: 'Application name',
          type: 'text',
          settings: {
            empty: true,
          },
          required: 'save',
          id: '1b2e3b7f-9667-4f2c-8dba-35b5cfd46396',
          name: 'name--text',
        },
      },
      html: '<label for="{{text.id}}">{{text.label}}</label><input type="{{text.type}}" id="{{text.id}}" name="{{text.name}}" value="{{text.value}}" placeholder="{{text.placeholder}}" />',
      required: 'save',
      id: 'name',
      type: 'text',
    },
    {
      name: 'Live Endpoint',
      description: 'endpoint to call when content goes live',
      validation: {
        validation,
      },
      inputs: {
        text: {
          validation: {
            function: 'validation',
            on: 'blur',
          },
          label: 'Live Endpoint',
          placeholder: 'Text Goes Here',
          type: 'text',
          settings: {
            empty: true,
          },
          id: 'b0811bda-0df1-4d27-824f-8fb2d69679bb',
          name: 'live-endpoint--text',
        },
      },
      html: '<label for="{{text.id}}">{{text.label}}</label><input type="{{text.type}}" id="{{text.id}}" name="{{text.name}}" value="{{text.value}}" placeholder="{{text.placeholder}}" />',
      id: 'live-endpoint',
      type: 'text',
    },
    {
      name: 'Updated Endpoint',
      description: 'endpoint to call when live content gets updated',
      validation: {
        validation,
      },
      inputs: {
        text: {
          validation: {
            function: 'validation',
            on: 'blur',
          },
          label: 'Updated Endpoint',
          placeholder: 'Text Goes Here',
          type: 'text',
          settings: {
            empty: true,
          },
          id: 'a46bfd3b-7a7f-4901-b14b-5be28ad4bbbf',
          name: 'updated-endpoint--text',
        },
      },
      html: '<label for="{{text.id}}">{{text.label}}</label><input type="{{text.type}}" id="{{text.id}}" name="{{text.name}}" value="{{text.value}}" placeholder="{{text.placeholder}}" />',
      id: 'updated-endpoint',
      type: 'text',
    },
    {
      name: 'Sunset Endpoint',
      description: 'endpoint to call when live content gets sunsetted',
      validation: {
        validation,
      },
      inputs: {
        text: {
          validation: {
            function: 'validation',
            on: 'blur',
          },
          label: 'Sunset Endpoint',
          placeholder: 'Text Goes Here',
          type: 'text',
          settings: {
            empty: true,
          },
          id: '8a3d5889-aa48-4ca0-af91-930efd7c5590',
          name: 'sunset-endpoint--text',
        },
      },
      html: '<label for="{{text.id}}">{{text.label}}</label><input type="{{text.type}}" id="{{text.id}}" name="{{text.name}}" value="{{text.value}}" placeholder="{{text.placeholder}}" />',
      id: 'sunset-endpoint',
      type: 'text',
    },
    {
      name: 'Client ID',
      description: 'do not edit',
      validation: {
        validation,
      },
      inputs: {
        text: {
          validation: {
            function: 'validation',
            on: 'blur',
          },
          label: 'Client ID',
          placeholder: 'Text Goes Here',
          type: 'text',
          settings: {
            empty: true,
          },
          id: '6d4d02bb-0a72-45d5-807a-2d70d229da47',
          name: 'client-id--text',
        },
      },
      html: '<label for="{{text.id}}">{{text.label}}</label><input type="{{text.type}}" id="{{text.id}}" name="{{text.name}}" value="{{text.value}}" placeholder="{{text.placeholder}}" />',
      id: 'client-id',
      type: 'text',
    },
    {
      name: 'Client Secret',
      description: 'do not edit',
      validation: {
        validation,
      },
      inputs: {
        text: {
          validation: {
            function: 'validation',
            on: 'blur',
          },
          label: 'Client Secret',
          placeholder: 'Text Goes Here',
          type: 'text',
          settings: {
            empty: true,
          },
          id: '55fc6ff0-b9d3-43a4-ad87-8c86647974fc',
          name: 'client-secret--text',
        }
      },
      html: '<label for="{{text.id}}">{{text.label}}</label><input type="{{text.type}}" id="{{text.id}}" name="{{text.name}}" value="{{text.value}}" placeholder="{{text.placeholder}}" />',
      id: 'client-secret',
      type: 'text',
    },
  ],
};
