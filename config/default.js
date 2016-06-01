'use strict';

const path = require('path');
const cfenv = require('cfenv');

const env = cfenv.getAppEnv();
env.host = env.url.replace(`:${env.port}`, '');


module.exports = {
  content: {
    base: 'content',
    home: {
      title: 'All Content Types',
    },
    actions: {
      add: 'add',
      edit: 'edit',
      save: 'save',
    },
    directory: path.join(__dirname, '../content-types'),
    messages: {
      missing: 'Content Type \'%type\' not found',
    },
  },
  knex: {
    dialect: 'pg',
    connection: {
      host: 'localhost',
      user: 'punchcard',
      database: 'punchcard',
    },
    debug: false,
    acquireConnectionTimeout: 1000,
  },
  site: {
    name: 'Punchcard CMS',
    nav: [
      {
        path: '.',
        label: 'Home',
      },
      {
        path: 'content',
        label: 'Content',
      },
      {
        path: 'users',
        label: 'Users',
      },
    ],
  },
  authentication: {
    messages: {
      badlogin: 'Email and/or passowrd incorrect',
    },
    paths: {
      login: '/login',
      logout: '/logout',
    },
  },
  env,
  cookies: {
    secure: false,
    secret: process.env.COOKIE_SECRET || 'babka',
  },
  roles: {
    config: {
      file: path.join(__dirname, 'all/roles.js'),
      error: 'Configuration must be an array',
    },
  },
  users: {
    home: {
      path: '/users',
      title: 'Users',
    },
    add: {
      path: '/users/add',
      title: 'Add a new user',
    },
    edit: {
      path: '/users/edit',
      title: 'Edit a user',
      error: 'User does not exist',
    },
    delete: {
      path: '/users/delete',
      title: 'Delete a user',
      error: 'User does not exist',
    },
    configFile: path.join(__dirname, '../lib/users/users.yml'),
  },
};
