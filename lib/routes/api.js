'use strict';

/*
 * @fileoverview API routing
 */
const api = require('../api');

/*
 * API Route Handling
 * @description Adds API routes handling to an Express app
 *
 * @param {object}  application - Express application
 * @returns {object} - Configured Express application
 */
const routes = application => {
  const app = application;

  return api.types(app).then(types => {
    /*
     *  API for all Content
     */
    // TODO: Tests
    // TODO: Return error if no items are found
    app.get('/api', (req, res, next) => {
      api.all(req.query).then(formatted => {
        res.json(formatted);
      }).catch(err => {
        next(err);
      });
    });

    /*
     *  API for all Content Types
     */
    // TODO: Tests
    // TODO: Return error if no items are found
    app.get('/api/types', (req, res) => {
      const formatted = api.content(req.query, types);

      res.json(formatted);
    });

    return app;
  });
};

module.exports = routes;
