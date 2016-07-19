'use strict';

/*
 * @fileoverview API routing
 */
const database = require('../database');

/*
 * API Route Handling
 * @description Adds API routes handling to an Express app
 *
 * @param {object}  application - Express application
 * @returns {object} - Configured Express application
 */
const routes = application => {
  return new Promise(resolve => {
    const app = application;

    app.get('/api', (req, res, next) => {
      database.select('*').from('live').then(rows => {
        res.json(rows);
      }).catch(err => {
        next(err);
      });
    });

    resolve(app);
  });
};

module.exports = routes;
