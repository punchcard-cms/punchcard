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
      revisions: 'revisions',
      save: 'save',
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
    messages: {
      missing: 'Workflow \'%workf\' for Content Type \'%type\' not found',
    }
  }
};
