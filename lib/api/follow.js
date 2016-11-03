'use strict';

const utils = require('./utils');
const database = require('../database');

/*
 * Follows returned items from the DB to retrieve their actual content
 *
 * @param {object} query - Request queries
 * @param {array} rows - Database rows of content
 * @param {array} types - Object of all content types
 * @param {array} total - Total rows selected
 * @param {object} organize - Organized object for use in pagination
 * @param {function} trx - Database transaction object
 *
 * @returns {object} - All items with attributes and the pagination for the items
 */
const follower = (query, rows, types, total, organize, trx) => {
  const items = rows.map(row => {
    const type = types.find(model => {
      return model.id === row['type-slug'];
    });

    if (typeof type === 'undefined') {
      return new Promise(res => {
        res({});
      });
    }

    return utils.one(query, row.id, type.attributes, trx);
  });

  return Promise.all(items).then(all => {
    const formatted = {
      items: all,
      pages: utils.page('api', organize, total[0].count),
    };

    return formatted;
  });
};

/*
 * Checks whether knex transaction exists, creates if doesn't
 *
 * @param {object} query - Request queries
 * @param {array} rows - Database rows of content
 * @param {array} types - Object of all content types
 * @param {array} total - Total rows selected
 * @param {object} organize - Organized object for use in pagination
 * @param {function} trx - Database transaction object
 *
 * @returns {object} - All items with attributes and the pagination for the items
 */
const follow = (query, rows, types, total, organize, trx) => {
  if (!trx) {
    return database.transaction(transaction => {
      return follower(query, rows, types, total, organize, transaction);
    });
  }

  return follower(query, rows, types, total, organize, trx);
};

module.exports = follow;
