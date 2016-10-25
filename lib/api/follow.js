'use strict';

const utils = require('./utils');

/*
 * Follow
 */
const follow = (query, rows, types, total, organize) => {
  const items = rows.map(row => {
    const type = types.find(model => {
      return model.id === row['type-slug'];
    });

    if (typeof type === 'undefined') {
      return new Promise(res => {
        res({});
      });
    }

    return utils.one(query, row.id, type.attributes);
  });

  return Promise.all(items).then(all => {
    const formatted = {
      items: all,
      pages: utils.page('api', organize, total[0].count),
    };

    return formatted;
  });
};

module.exports = follow;
