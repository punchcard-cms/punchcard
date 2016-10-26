'use strict';

const utils = require('./utils');
const database = require('../database');

/*
 * Follows returned items from the DB to retrieve their actual content
 *
 * @param {object} query - Request queries
 * @param {array} rows - Database rows of content
 * @param {array} models - Object of all content types
 * @param {array} total - Total rows selected
 * @param {object} organize - Organized object for use in pagination
 *
 * @returns {object} - All items with attributes and the pagination for the items
 */
const follow = (query, rows, models, total, organize) => {
  return database.transaction(trx => {
    const items = rows.map(row => {
      const type = models.find(model => {
        return model.id === row['type-slug'];
      });

      if (typeof type === 'undefined') {
        return new Promise(res => {
          res({});
        });
      }

      return utils.one(query, row.id, type.attributes, models, trx);
    });

    return Promise.all(items).then(all => {
      const formatted = {
        items: all,
        pages: utils.page('api', organize, total[0].count),
      };

      return formatted;
    });
  });
};

module.exports = follow;
