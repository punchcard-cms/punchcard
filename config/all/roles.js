'use strict';

/**
 * @fileoverview Roles configuration
 */

module.exports = [
  {
    name: 'Administrator',
    id: 'admin',
    permissions: true,
    content: {
      create: true,
      edit: true,
      delete: true,
    },
    workflows: {
      foo: true,
    },
  },
  {
    name: 'Content Creator',
    id: 'creator',
    permissions: [
      'content',
    ],
    content: {
      create: true,
      edit: true,
      delete: true,
    },
    workflows: {
      foo: true,
    },
  },
  {
    name: 'API Editor',
    id: 'api-editor',
    permissions: [
      'content',
    ],
    content: {
      create: [
        'api',
      ],
      edit: [
        'api',
      ],
      delete: [
        'api',
      ],
    },
    workflows: {
      foo: true,
    },
  },
  {
    name: 'API Writer',
    id: 'api-writer',
    permissions: [
      'content',
    ],
    content: {
      edit: [
        'api',
      ],
    },
    workflows: {
      foo: true,
    },
  },
];
