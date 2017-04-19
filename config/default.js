'use strict';

const path = require('path');
const cfenv = require('cfenv');

const roles = require('./all/roles');
const env = cfenv.getAppEnv();
env.host = env.url.replace(`:${env.port}`, '');


module.exports = {
  applications: {
    base: 'applications',
    actions: {
      add: 'add',
      delete: 'delete',
      edit: 'edit',
      save: 'save',
      secret: 'secret',
      update: 'update',
    },
    messages: {
      missing: {
        id: 'An application with the id \'%id\' was not found',
      },
    },
  },
  content: {
    base: 'content',
    home: {
      title: 'All Content Types',
    },
    actions: {
      add: 'add',
      approve: 'approve',
      edit: 'edit',
      revisions: 'revisions',
      save: 'save',
      new: 'Save Revision',
    },
    plugins: {
      directory: [path.join(__dirname, '../input-plugins')],
    },
    plugins: {
      directory: [],
    },
    directory: path.join(__dirname, '../content-types'),
    messages: {
      content: {
        title: 'Revisions for \'%id\'',
      },
      format: {
        id: 'Content ID must be in UUID format',
        revision: 'Revision must be a number',
      },
      missing: {
        type: 'Content Type \'%type\' not found',
        id: 'Content with ID \'%id\' in Content Type \'%type\' not found',
        revision: 'Revision \'%revision\' for ID \'%id\' in Content Type \'%type\' not found',
      },
      revisions: {
        title: 'Revision \'%revision\' for \'%id\'',
      },
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
    acquireConnectionTimeout: 2000,
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
      login: {
        error: 'Email and/or password incorrect',
      },
    },
    login: {
      path: '/login',
      title: 'Login',
    },
    logout: {
      path: '/logout',
      title: 'Logout',
    },
  },
  env,
  cookies: {
    secure: false,
    secret: process.env.COOKIE_SECRET || 'babka',
  },
  roles: {
    messages: {
      config: {
        type: 'Configuration must be an array',
      },
    },
    config: roles,
  },
  users: {
    base: 'users',
    actions: {
      add: 'add',
      edit: 'edit',
      delete: 'delete',
      save: 'save',
      update: 'update',
    },
    setup: {
      title: 'Create an admin account for your new CMS',
      button: 'Create Admin Account',
    },
    messages: {
      missing: {
        id: 'A user with the id \'%id\' was not found',
      },
      errors: {
        edit: 'User does not exist',
        delete: 'User does not exist',
        current: 'Cannot delete logged-in user',
      },
      format: {
        id: 'User ID must be a number.',
      },
    },
  },
  workflows: {
    messages: {
      approved: 'This content has already completed the approval process',
      missing: 'Workflow \'%workflow\' for Content Type \'%type\' not found',
    },
  },
  storage: {
    type: 'fs',
    dest: 'public/files',
    settings: {},
    public: '/files', // Can include {{dest}} for the dest path
    temp: {
      dest: 'public/tmp/',
      public: '/tmp',
    },
  },
};
