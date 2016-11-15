'use strict';

const validation = require('../../').validation;

/**
 * Mock of `users` merged-content-type object
 * @type {Object}
 */
module.exports = {
  name: 'Users',
  description: 'An individual user',
  id: 'users',
  identifier: 'email',
  attributes: [
    {
      name: 'Email',
      description: 'Email address for your account',
      validation: {
        validation,
      },
      inputs: {
        email: {
          validation: {
            function: 'validation',
            on: 'blur',
          },
          type: 'email',
          label: 'Email',
          placeholder: 'add your email',
          settings: {
            'empty': true,
          },
          id: '6b33a0fb-053d-4850-b041-f0adeea50a67',
          name: 'email--email',
        },
      },
      html: '<label for="{{email.id}}">{{email.label}}</label><input type="{{email.type}}" id="{{email.id}}" name="{{email.name}}" value="{{email.value}}" placeholder="{{email.placeholder}}" />',
      required: 'save',
      id: 'email',
      type: 'email',
    },
    {
      name: 'Password',
      description: 'Gotta get in',
      validation: {
        validation,
      },
      inputs: {
        password: {
          validation: {
            function: 'validation',
            on: 'blur',
          },
          label: 'Password',
          placeholder: '',
          type: 'password',
          id: '224a4579-501b-4345-a56f-edd10df9afcf',
          name: 'password--password',
        },
      },
      html: '<label for="{{password.id}}">{{password.label}}</label><input type="{{password.type}}" id="{{password.id}}" name="{{password.name}}" value="{{password.value}}" placeholder="{{password.placeholder}}" />',
      id: 'password',
      type: 'password',
    },
    {
      name: 'Authorization role',
      description: 'Select authorization level',
      validation: {
        validation,
      },
      inputs: {
        select: {
          validation: {
            function: 'validation',
            on: 'blur',
          },
          label: 'Authorization role',
          options: [
            {
              label: 'Administrator',
              value: 'admin',
            },
            {
              label: 'Content Creator',
              value: 'creator',
            },
          ],
          type: 'select',
          settings: {
            'multiple': true,
          },
          id: '44d04004-9529-4d76-813c-d4449953402f',
          name: 'role--select',
        },
      },
      html: '<label for="{{select.id}}">{{select.label}}</label><select id="{{select.id}}" name="{{select.name}}"{% if settings.multiple %}multiple="multiple"{% endif %}>{% for option in select.options %}<option value="{{option.value}}" {% if option.value == select.value %}selected{% endif %}>{{option.label}}</option>{% endfor %}</select>',
      id: 'role',
      type: 'select',
    },
  ],
};
