'use strict';

/**
 * @fileoverview Roles configuration
 *
 * @returns {array} Array of user roles
 */
module.exports = [
  {
    name: 'Administrator',
    id: 'admin',
    allows: [
      {
        resources: '/content/services',
        permissions: '*',
      },
      {
        resources: '/users',
        permissions: '*',
      },
    ],
    workflows: {
      foo: true,
    },
  },
  {
    name: 'Content Creator',
    id: 'creator',
    allows: [
      {
        resources: '/content/services',
        permissions: '*',
      },
    ],
  },
];
