'use strict';

const nunjucks = require('nunjucks');
const path = require('path');

const views = [
  path.join(process.cwd(), 'views'),
  path.join(process.cwd(), 'templates'),
  path.join(__dirname, '..', '..', 'views'),
  path.join(__dirname, '..', '..', 'templates'),
];

module.exports = (app) => {
  return new Promise((res) => {
    nunjucks.configure(views, {
      'autoescape': true,
      'express': app,
    });
    app.set('view engine', 'html');

    res(app);
  });
};
