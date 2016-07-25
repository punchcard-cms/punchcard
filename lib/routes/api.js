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

    /*
     *  API for all Content of a given Content Type
     */
    // TODO: Tests
    // TODO: Return error if no items are found
    app.get('/api/types/:type', (req, res, next) => {
      api.ofType(req.query, req.params.type).then(formatted => {
        res.json(formatted);
      }).catch(err => {
        next(err);
      });
    });

    /*
     *  Specific Piece of Content
     */
    // TODO: Tests
    // TODO: Return error if no items are found
    app.get('/api/types/:type/:id', (req, res, next) => {
      api.one(req.query, req.params.id).then(formatted => {
        res.json(formatted);
      }).catch(err => {
        next(err);
      });
    });

    return app;
  });
};

module.exports = routes;
