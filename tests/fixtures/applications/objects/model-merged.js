'use strict';

const validation = require('../../_utils').validation;

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
          required: 'save',
          id: 'defa2793-2720-4452-9925-bd82925a6a0a',
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
        url: {
          validation: {
            function: 'validation',
            on: 'blur',
          },
          label: 'Live Endpoint',
          placeholder: 'http://',
          type: 'url',
          id: 'c0dbbc72-d8cf-4d15-a88c-c8d09a4d59c8',
          name: 'live-endpoint--url',
        },
      },
      html: '<label for="{{url.id}}">{{url.label}}</label><input type="{{url.type}}" id="{{url.id}}" name="{{url.name}}" value="{{url.value}}" placeholder="{{url.placeholder}}" />',
      id: 'live-endpoint',
      type: 'url',
    },
    {
      name: 'Updated Endpoint',
      description: 'endpoint to call when live content gets updated',
      validation: {
        validation,
      },
      inputs: {
        url: {
          validation: {
            function: 'validation',
            on: 'blur',
          },
          label: 'Updated Endpoint',
          placeholder: 'http://',
          type: 'url',
          id: 'cc91b1bf-7a8e-497e-9c97-2cec73ba8fc3',
          name: 'updated-endpoint--url',
        },
      },
      html: '<label for="{{url.id}}">{{url.label}}</label><input type="{{url.type}}" id="{{url.id}}" name="{{url.name}}" value="{{url.value}}" placeholder="{{url.placeholder}}" />',
      id: 'updated-endpoint',
      type: 'url',
    },
    {
      name: 'Sunset Endpoint',
      description: 'endpoint to call when live content gets sunsetted',
      validation: {
        validation,
      },
      inputs: {
        url: {
          validation: {
            function: 'validation',
            on: 'blur',
          },
          label: 'Sunset Endpoint',
          placeholder: 'http://',
          type: 'url',
          id: 'd0f5a142-f84e-4c8d-ac55-f71d544ecb0a',
          name: 'sunset-endpoint--url',
        },
      },
      html: '<label for="{{url.id}}">{{url.label}}</label><input type="{{url.type}}" id="{{url.id}}" name="{{url.name}}" value="{{url.value}}" placeholder="{{url.placeholder}}" />',
      id: 'sunset-endpoint',
      type: 'url',
    },
  ],
};
