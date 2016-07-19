'use strict';

/*
 * @fileoverview API routing
 */
const _ = require('lodash');
const Promise = require('bluebird');
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
  const app = application;
  let cts = _.cloneDeep(app.get('content-types')).map(ct => {
    const type = {};

    Object.keys(ct).forEach(attr => {
      if (attr !== 'attributes') {
        type[attr] = ct[attr];
      }
    });

    return type;
  });
  const ctKeys = Object.keys(cts[0]).sort().filter(key => {
    if (key === 'name') {
      return false;
    }

    return true;
  });
  ctKeys.unshift('name');

  cts = cts.map(ct => {
    const type = ct;
    type.meta = {
      url: `/api/types/${ct.id}`,
    };

    return type;
  });

  return Promise.map(cts, ct => {
    return database('live').count('id').where({
      'type-slug': ct.id,
    }).then(total => {
      const type = ct;
      type.meta.count = total[0].count;

      return type;
    });
  }).then(types => {
    /*
     *  API for all Content
     */
    // TODO: Tests
    // TODO: Return error if no items are found
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

    /*
     *  API for all Content Types
     */
    // TODO: Tests
    // TODO: Return error if no items are found
    app.get('/api/types', (req, res) => {
      const organize = utils.api.organize(req.query, ctKeys);
      const pages = utils.api.pagination('api/types', organize, types.length);

      const items = _.sortBy(types, o => {
        return o[organize.sort.by];
      });

      if (organize.sort.dir === 'desc') {
        items.reverse();
      }

      const formatted = {
        items: _.cloneDeep(items).slice(organize.page.offset - 1, organize.page.offset + organize.page.limit - 1),
        pages,
      };

      res.json(formatted);
    });

    return app;
  });
};

module.exports = routes;
