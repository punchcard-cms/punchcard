'use strict';

const apis = require('./apis');
const utils = require('./utils');

/*
 * Follow
 */
const follow = (query, rows, types, total, organize) => {
  const items = rows.map(row => {
    const type = types.find(model => {
      if (model.id === row.type_slug) {
        return true;
      }

      return false;
    });

    return apis.one(query, row.id, type.attributes);
  });

  return Promise.all(items).then(all => {
    const formatted = {
      items: all,
      pages: utils.page('api', organize, total[0].count),
    };

    return formatted;
  });
};

return follow;
