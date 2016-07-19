'use strict';

/*
 * @fileoverview API routing
 */
const database = require('../database');
const utils = require('../utils');

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
    const cts = app.get('content-types');
    const ctKeys = Object.keys(cts[0]).sort().filter(key => {
      if (key === 'name') {
        return false;
      }

      return true;
    });
    ctKeys.unshift('name');

    // TODO: Tests
    app.get('/api', (req, res, next) => {
      const organize = utils.api.organize(req.query);

      database.select('*').from('live').orderBy(organize.sort.by, organize.sort.dir).offset(organize.page.offset).limit(organize.page.limit).then(rows => {
        return database('live').count('id').then(total => {
          const formatted = {
            items: utils.api.format(rows),
            pages: utils.api.pagination('api', organize, total[0].count),
          };

          res.json(formatted);
        });
      }).catch(err => {
        next(err);
      });
    });

    resolve(app);
  });
};

module.exports = routes;
