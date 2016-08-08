'use strict';

const config = require('config');

const roles = config.roles.config.map(role => {
  return {
    label: role.name,
    value: role.id,
  };
});

module.exports = {
  name: 'Users',
  description: 'An individual user',
  id: 'users',
  identifier: 'email',
  attributes: [
    {
      type: 'email',
      id: 'email',
      name: 'Email',
      description: 'Email address for your account',
    },
    {
      type: 'password',
      id: 'password',
      name: 'Password',
      description: 'Gotta get in',
    },
    {
      type: 'select',
      id: 'role',
      name: 'Authorization role',
      description: 'Select authorization level',
      inputs: {
        select: {
          options: roles,
        },
      },
    },
  ],
};
