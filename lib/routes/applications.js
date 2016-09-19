'use strict';

/*
 * @fileoverview Applications routing
 */
const config = require('config');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

const applications = require('../applications');

/*
 * Webhooks Route Handling
 * @description Adds webhook routes handling to an Express app
 *
 * @param {object}  application - Express application
 * @returns {object} - Configured Express application
 */
const routes = application => {
  const app = application;

  /*
   *  Landing for all applications
   */
  app.get(`/${config.applications.base}`, applications.routes.all);

  /*
   *  Add new application
   */
  app.get(`/${config.applications.base}/${config.applications.actions.add}`, applications.routes.add);

  /*
   *  View/edit/delet a single application
   */
  app.get(`/${config.applications.base}/:id`, applications.routes.one);

  /*
   *  Save a single application
   */
  app.post(`/${config.applications.base}/${config.applications.actions.save}`, multipartMiddleware, applications.routes.save);

  return app;
};

module.exports = routes;
