'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

const utils = require('./utils');
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

    return type;
  });

  return Promise.map(cts, ct => {
    return database('live').count('id').where({
      'type-slug': ct.id,
    }).then(total => {
      const type = ct;
      type.meta.count = parseInt(total[0].count, 10);

      return type;
    });
  }).then(contentTypes => {
    return {
      keys: ctKeys,
      all: contentTypes,
    };
  });
};

/*
 *  API for all Content
 *
 * @param {object} query - Request queries
 *
 * @returns {object} - All items and the pagination for the items
 */
// TODO: Return error if no items are found
const all = query => {
  const organize = utils.organize(query);

  return database('live').select('*').orderBy(organize.sort.by, organize.sort.dir).offset(organize.page.offset).limit(organize.page.limit).then(rows => {
    return database('live').count('id').then(total => {
      const formatted = {
        items: utils.format(rows),
        pages: utils.page('api', organize, total[0].count),
      };

      return formatted;
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

  const formatted = {
    items: _.cloneDeep(items).slice(organize.page.offset, organize.page.offset + organize.page.limit),
    pages,
  };

  return formatted;
};

/*
 *  API for all Content of a given Type
 *
 * @param {object} query - Request queries
 *
 * @returns {object} - All items and the pagination for the items
 */
// TODO: Return error if no items are found
const ofType = (query, type) => {
  const organize = utils.organize(query);

  return database('live').select('*').where({
    'type-slug': type,
  }).orderBy(organize.sort.by, organize.sort.dir).offset(organize.page.offset).limit(organize.page.limit).then(rows => {
    return database('live').where({
      'type-slug': type,
    }).count('id').then(total => {
      const formatted = {
        items: utils.format(rows),
        pages: utils.page('api', organize, total[0].count),
      };

      return formatted;
    });
  });
};

/*
 *  A Specific Piece of Content
 *
 * @param {object} query - Request queries
 *
 * @returns {object} - All items and the pagination for the items
 */
// TODO: Return error if no items are found
const one = (query, id) => {
  // const organize = utils.organize(query);

  return database('live').select('*').where({
    id,
  }).then(rows => {
    const formatted = utils.format(rows, true)[0];
    if (formatted) {
      const type = {
        name: formatted.type,
        slug: formatted.type_slug,
        url: `/api/types/${formatted.type_slug}`,
      };

      formatted.type = type;
      delete formatted.type_slug;

      return formatted;
    }

    return {};
  });
};

module.exports = {
  types,
  all,
  content,
  ofType,
  one,
};
