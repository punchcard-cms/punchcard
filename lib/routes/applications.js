'use strict';

/*
 * @fileoverview Applications routing
 */
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
  app.get('/applications', (req, res) => {
    applications.routes.all(res);
  });

  return app;
};

module.exports = routes;
