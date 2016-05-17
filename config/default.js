'use strict';

const path = require('path');
const cfenv = require('cfenv');

const env = cfenv.getAppEnv();
env.host = env.url.replace(`:${env.port}`, '');


module.exports = {
  contentTypes: {
    contentTypesHome: {
      path: '/content',
      title: 'Content Type ALL Landing Page',
      desc: 'This is the content type ALL landing page.',
    },
    contentTypeDir: path.join(__dirname, '../content-types'),
    contentTypeExt: 'yml',
    viewsDir: path.join(__dirname, '../views/'),
    formTemplateFile: '_content-type-form.html',
  },
  knex: {
    dialect: 'pg',
    connection: {
      host: 'localhost',
      user: 'punchcard',
      database: 'punchcard',
    },
    debug: true,
    acquireConnectionTimeout: 1000,
  },
  env,
};
