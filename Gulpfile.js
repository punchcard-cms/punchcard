'use strict';

const gulp = require('gulp');
const config = require('config');

require('punchcard-runner')(gulp, {
  application: {
    library: {
      src: [
        'lib',
        'routes',
        'config',
        'content-types'
      ],
    }
  },
  tasks: {
    nodemon: {
      extension: 'js html yml'
    }
  },
  server: {
    port: config.env.port,
    host: config.env.host
  }
});
