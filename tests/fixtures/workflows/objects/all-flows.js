'use strict';

/**
 * Mock of all workflows after yaml files imported
 * @type {Array}
 */
module.exports = [
  {
    'name': 'Editor Approve',
    'id': 'editor-approve',
    'steps': [
      {
        'name': 'Send to Legal',
      },
      {
        'name': 'Send to Editor',
      },
      {
        'name': 'Publish',
      },
    ],
  },
  {
    'name': 'Self Publish',
    'id': 'self-publish',
    'steps': [
      {
        'name': 'Publish',
        'self': true,
      },
    ],
  },
];
