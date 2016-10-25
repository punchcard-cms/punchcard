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

  const types = api.types(app);

  /*
   *  API for all Content
   */
  // TODO: Tests
  // TODO: Return error if no items are found
  app.get('/api', (req, res, next) => {
    api.all(req.query, req.content.types).then(formatted => {
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
  app.get('/api/types', (req, res, next) => {
    api.content(req.query, types).then(formatted => {
      res.json(formatted);
    }).catch(err => {
      next(err);
    });
  });

  /*
   *  API for all Content of a given Content Type
   */
  // TODO: Tests
  // TODO: Return error if no items are foun
  app.get('/api/types/:type', (req, res, next) => {
    const type = req.content.types.find(item => {
      return item.id === req.params.type.toLowerCase();
    });

    api.ofType(req.query, type).then(formatted => {
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
    const type = req.content.types.find(item => {
      return item.id === req.params.type.toLowerCase();
    });

    if (types.length === 0) {
      return next(new Error(`Content type '${req.params.type}' not found`));
    }

    return api.one(req.query, req.params.id, type.attributes).then(formatted => {
      res.json(formatted);
    }).catch(err => {
      next(err);
    });
  });

  return app;
};

module.exports = routes;
