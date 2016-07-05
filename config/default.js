'use strict';

const path = require('path');
const cfenv = require('cfenv');

const roles = require('./all/roles');
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
      approve: 'approve',
      edit: 'edit',
      save: 'save',
    },
    directory: path.join(__dirname, '../content-types'),
    messages: {
      workflow: {
        comments: {
          add: 'Comment: (required)',
        },
        approval: {
          choice: 'Please choose one:',
        }
      },
      format: {
        revision: 'Revision must be a number',
      },
      missing: {
        data: {
          type: 'Content Type \'%type\' not found',
          id: 'Content with ID \'%id\' in Content Type \'%type\' not found',
          revision: 'Revision \'%revision\' in Content Type \'%type\' not found',
        },
        url: {
          revision: 'URL missing revision number',
          type: 'URL missing content type',
        },
        type: 'Content Type \'%type\' not found',
        id: 'Content with ID \'%id\' in Content Type \'%type\' not found',
        revision: 'Revision \'%revision\' in Content Type \'%type\' not found',
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
      login: {
        error: 'Email and/or passowrd incorrect',
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
    },
    messages: {
      errors: {
        edit: 'User does not exist',
        delete: 'User does not exist',
        current: 'Cannot delete logged-in user',
      },
    },
  },
  workflows: {
    default: 'self-publish',
    directory: path.join(__dirname, '../workflows'),
    messages: {
      missing: 'Workflow \'%workflow\' in Content Type \'%type\' not found',
    }
  }
};
