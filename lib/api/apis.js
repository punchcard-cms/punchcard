'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

const utils = require('./utils');
const follow = require('./follow');
const database = require('../database');

/*
 * Determines Content Types and Content Type Keys
 *
 * @param {object} app - An Express app
 *
 * @returns {object} types - An object containing `key` of Content Type keys and `types` of all Content Types
 */
const types = app => {
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

    delete type.workflow;
    delete type.identifier;

    return type;
  });

  return {
    keys: ctKeys,
    all: cts,
  };
};

/*
 *  API for all Content
 *
 * @param {object} query - Request queries
 * @param {array} models - Object of all content types
 *
 * @returns {object} - All items and the pagination for the items
 */
// TODO: Return error if no items are found
const all = (query, models) => {
  const organize = utils.organize(query);

  const results = database('live').select('*');

  if (query.key) {
    results.where({
      key: query.key,
    });
  }
  else if (query.key_slug) { // eslint-disable-line camelcase
    results.where({
      'key-slug': query.key_slug, // eslint-disable-line camelcase
    });
  }

  return results.orderBy(organize.sort.by, organize.sort.dir).offset(organize.page.offset).limit(organize.page.limit).then(rows => {
    return database('live').count('id').then(total => {
      if (query.follow) {
        return follow(query, rows, models, total, organize);
      }

      return utils.format(rows, '', models, query).then(formatted => {
        return {
          items: formatted,
          pages: utils.page('api', organize, total[0].count),
        };
      });
    });
  });
};

/*
 *  API for all Content Types
 *
 * @param {object} query - Request queries
 * @param {object} cts - Content types
 *
 * @returns {object} - All items and the pagination for the items
 */
// TODO: Return error if no items are found
const content = (query, cts) => {
  const organize = utils.organize(query, cts.keys);
  const pages = utils.page('api/types', organize, cts.all.length);

  const items = _.sortBy(cts.all, o => {
    return o[organize.sort.by];
  });

  if (organize.sort.dir === 'desc') {
    items.reverse();
  }

  const results = _.cloneDeep(items).slice(organize.page.offset, organize.page.offset + organize.page.limit);

  return Promise.map(results, ct => {
    return database('live').count('id').where({
      'type-slug': ct.id,
    }).then(total => {
      const type = ct;
      type.meta.count = parseInt(total[0].count, 10);

      return type;
    });
  }).then(formatted => {
    return {
      items: formatted,
      pages,
    };
  });
};

/*
 *  API for all Content of a given Type
 *
 * @param {object} query - Request queries
 * @param {object} model - The content type model
 * @param {array} models - Object of all content types
 *
 * @returns {object} - All items and the pagination for the items
 */
// TODO: Return error if no items are found
const ofType = (query, model, models) => {
  const organize = utils.organize(query);

  const where = {
    'type-slug': model.id,
  };

  if (query.key) {
    where.key = query.key;
  }
  else if (query.key_slug) { // eslint-disable-line camelcase
    where['key-slug'] = query.key_slug; // eslint-disable-line camelcase
  }

  return database('live').select('*').where(where).orderBy(organize.sort.by, organize.sort.dir).offset(organize.page.offset).limit(organize.page.limit).then(rows => {
    return database('live').where({
      'type-slug': model.id,
    }).count('id').then(total => {
      if (query.follow) {
        return follow(query, rows, models, total, organize);
      }

      return utils.format(rows, model, models, query).then(formatted => {
        return {
          items: formatted,
          pages: utils.page('api', organize, total[0].count),
        };
      });
    });
  });
};

/*
 *  A Specific Piece of Content
 *
 * @param {object} query - Request queries
 * @param {string} id - The GUID to search
 * @param {array} model - Array of content type attributes
 *
 * @returns {object} - All items and the pagination for the items
 */
// TODO: Return error if no items are found
const one = (query, id, model, models) => {
  return utils.one(query, id, model, models);
};

module.exports = {
  types,
  all,
  content,
  ofType,
  one,
};
