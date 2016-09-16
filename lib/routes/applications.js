'use strict';

/*
 * @fileoverview Applications routing
 */
const config = require('config');

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
   *  Landing for all webhooks
   */
  app.get(`/${config.applications.base}`, applications.routes.all);

  /*
   *  Add new webhook
   */
  app.get(`/${config.applications.base}/${config.applications.actions.new}`, applications.routes.add);

  /*
   *  View/edit/delet a single webhook
   */
  app.get(`/${config.applications.base}/:id`, applications.routes.one);

  /*
   *  View/edit/delet a single webhook
   */
  app.post(`/${config.applications.base}/${config.applications.actions.save}`, applications.routes.save);

  return app;
};

module.exports = routes;
