'use strict';

const _ = require('lodash');

const database = require('../database');
const schemas = require('../database/schemas');
const utils = require('../utils');

const liveSchema = utils.singleItem('name', 'live', schemas).fields.map(field => {
  return field.name;
});

/**
 * Convert value to a reference value
 *
 * @param {string} val - content of input
 * @param {object} input - input object from content model
 * @param {string} location - The location of the reference
 * @param {object} references - All references
 *
 * @returns {string|object} either the original value or an object for a reference value
 */
const reference = (val, input, location, references) => {
  const value = val;
  const refs = references;

  if (input.hasOwnProperty('reference') && input.reference === true) {
    const type = _.get(input, 'settings.contentType', null);

    // add content type information to value
    if (type !== null) {
      if (!refs.hasOwnProperty(value)) {
        refs[value] = {
          paths: [],
          type,
        };
      }

      refs[value].paths.push(location);

      return refs;
    }
  }

  return false;
};

/*
 * Formats raw attributes in to API output
 *
 * @param {array} attrs - Array of objects representing the raw attribute content
 * @param {array} model - Array of objects representing the content type's attribute model
 */
const attributes = (attrs, model, models, query, trx) => {
  const params = _.cloneDeep(query) || {};
  const result = {};
  let references = {};

  // check that query has depth property
  if (!params.hasOwnProperty('depth') || isNaN(parseInt(params.depth, 10))) {
    params.depth = 0;
  }

  model.forEach(attr => {
    if (!attr.hasOwnProperty('repeatable')) {
      const inputs = Object.keys(attr.inputs);
      const total = Object.keys(inputs).length;

      // one input, not repeatable
      if (total === 1) {
        const value = _.get(attrs, `${attr.id}.${inputs[0]}.value`, null);

        // add value to result
        result[attr.id] = value;

        // add reference object, if there is one
        const ref = reference(value, attr.inputs[inputs[0]], `${attr.id}`, references);

        if (ref) {
          references = ref;
        }
      }
      else {
        result[attr.id] = {};

        inputs.forEach(inp => {
          const value = _.get(attrs, `${attr.id}.${inp}.value`, null);

          // add value to result
          result[attr.id][inp] = value;

          // add reference object, if there is one
          const ref = reference(value, attr.inputs[inp], `${attr.id}.${inp}`, references);

          if (ref) {
            references = ref;
          }
        });
      }
    }
    else {
      let inputs;
      let input;

      // compensates for array of inputs, this is a bug: https://github.com/punchcard-cms/content-types/issues/133
      //  content-types adds inputs according the the `min` config attribute
      if (Array.isArray(attr.inputs)) {
        // will get the 1st input in a repeatable with a `min` config
        inputs = Object.keys(attr.inputs[0]);
        input = attr.inputs[0][inputs[0]];
      }
      else {
        inputs = Object.keys(attr.inputs);
        input = attr.inputs[inputs[0]];
      }

      if (_.has(attrs, attr.id)) {
        // items is the repeated content for this attribute
        let items = _.get(attrs, attr.id, []);

        if (!Array.isArray(items)) {
          items = [items];
        }

        result[attr.id] = items.map((item, index) => {
          if (Object.keys(items[0]).length === 1) {
            const value = _.get(item, `${inputs[0]}.value`, null);

            // add reference object, if there is one
            const ref = reference(value, input, `${attr.id}[${index}].${inputs[0]}`, references);

            if (ref) {
              references = ref;
            }

            // add value to result
            return _.get(item, `${inputs[0]}.value`, null);
          }

          const repeat = {};

          inputs.forEach((inp) => {
            const value = _.get(item, `${inp}.value`, null);

            // add reference object, if there is one
            const ref = reference(value, attr.inputs[inp], `${attr.id}[${index}].${inp}`, references);

            if (ref) {
              references = ref;
            }

            // add value to result
            repeat[inp] = value;
          });

          return repeat;
        });
      }
      else {
        result[attr.id] = null;
      }
    }
  });

  if (Object.keys(references).length > 0) {
    params.depth--;

    // we've reached our depth, follow no more
    if (params.depth <= 0) {
      params.follow = false;
    }

    const items = Object.keys(references).map(id => {
      const mod = models.find(type => {
        return type.id === references[id].type;
      });

      // eslint will loop on this, so hiding
      return one(params, id, mod.attributes, models, trx); // eslint-disable-line no-use-before-define
    });

    return Promise.all(items).then(row => {
      if (row.length > 0 && row[0] !== null) {
        row.forEach(rw => {
          if (references[rw.id] && Array.isArray(references[rw.id].paths)) {
            references[rw.id].paths.forEach(path => {
              _.set(result, path, rw);
            });
          }
        });
      }

      return result;
    }).catch(e => {
      console.log(e); // eslint-disable-line no-console
    });
  }

  return new Promise(res => {
    res(result);
  });
};

/*
 * Formats raw live data in to consumable returns
 *
 * @param {array} content - Array of objects representing the raw DB query of content
 * @param {array} attrs - If included, will include attributes of the content model
 * @param {array} models - If included, will include all content type models
 * @param {object} query - If included, will include query parameters
 *
 * @returns {array} - formatted object of content
 */
const format = (content, attrs, models, query, trx) => {
  const params = _.cloneDeep(query) || {};
  let atrs = attrs || [];
  const mods = _.cloneDeep(models) || [];

  if (!params.hasOwnProperty('depth') || isNaN(parseInt(params.depth, 10))) {
    params.depth = 0;
  }

  if (!Array.isArray(atrs)) {
    return new Promise((res, rej) => {
      rej('Content model attributes must be an array');
    });
  }

  if (!Array.isArray(mods)) {
    return new Promise((res, rej) => {
      rej('Content models parameter must be an array');
    });
  }

  const formatted = content.map(item => {
    const result = {
      id: item.id,
      type: item.type,
      type_slug: item['type-slug'], // eslint-disable-line camelcase
      key: item.key,
      key_slug: item['key-slug'], // eslint-disable-line camelcase
    };

    // get the attributes model for this piece of content
    if (mods.length > 1) {
      const type = mods.find(typ => {
        return typ.id === item['type-slug'];
      });

      atrs = type.attributes;
    }

    if (atrs.length > 0 && params.follow) {
      return attributes(item.attributes, atrs, mods, params, trx).then(rattrs => {
        result.attributes = rattrs;

        return result;
      });
    }

    result.meta = {
      url: `/api/types/${item['type-slug']}/${item.id}`,
    };

    return new Promise(res => {
      res(result);
    });
  });

  return Promise.all(formatted);
};

/*
 * Determines raw live data organization
 *
 * @param {object} query - Request query params
 * @param {array} custom - A custom array of keys to use
 *
 * @returns {object} - Object with sort key, sort direction, pagination count and offset
 */
const organize = (query, custom) => {
  const params = query || {};
  let lookup = custom;

  if (lookup && !Array.isArray(lookup)) {
    lookup = false;
  }

  let sort = params.sort || 'key';
  let sortDir = params.sort_dir || 'asc';
  let sortKeys = lookup || liveSchema;

  let page = parseInt(params.page, 10) || 1;
  let perPage = parseInt(params.per_page, 10) || 30;
  let count = 0;


  //////////////////////////////
  // Sorting
  //////////////////////////////
  // Ensure sort is an available key
  sortKeys = sortKeys.filter(key => {
    if (key === 'attributes') {
      return false;
    }

    return true;
  });
  if (sortKeys.indexOf(sort) < 0) {
    if (lookup) {
      sort = lookup[0];
    }
    else {
      sort = 'key';
    }
  }

  // Ensure sorting is either ascending or descending
  if (sortDir !== 'asc' && sortDir !== 'desc') {
    sortDir = 'asc';
  }

  //////////////////////////////
  // Pagination
  //////////////////////////////
  // Ensure there is at least one page returned
  if (page < 1) {
    page = 1;
  }

  // Ensure pagination fits within parameters
  if (perPage < 1) {
    perPage = 1;
  }
  else if (perPage > 100) {
    perPage = 100;
  }

  // Calculate offset
  count = (page - 1) * perPage;

  return {
    sort: {
      by: sort,
      dir: sortDir,
    },
    page: {
      offset: count,
      limit: perPage,
      page,
    },
  };
};

/*
 * Build Pagination Links
 *
 * @param {string} base - Base URL
 * @param {object} organized - Organized sort and pagination
 * @param {number} count - Total number of items
 */
const page = (base, organized, count) => {
  const baseURL = `/${base}?sort=${organized.sort.by}&sort_dir=${organized.sort.dir}&per_page=${organized.page.limit}`;
  const pages = {
    first: `${baseURL}&page=1`,
  };
  let total = Math.floor(count / organized.page.limit);
  if (count % organized.page.limit !== 0) {
    total += 1;
  }

  // If not the first page, add a previous link
  if (organized.page.page !== 1 && organized.page.page <= total) {
    pages.prev = `${baseURL}&page=${organized.page.page - 1}`;
  }
  else {
    pages.prev = false;
  }

  // Add next link if not on the last page
  if (organized.page.page + 1 <= total) {
    pages.next = `${baseURL}&page=${organized.page.page + 1}`;
  }
  else {
    pages.next = false;
  }

  // Add last page
  pages.last = `${baseURL}&page=${total}`;

  // If first and last are the same, set them to false
  if (pages.first === pages.last) {
    pages.first = false;
    pages.last = false;
  }

  // If there are no items, set everything to false
  if (total === 0) {
    pages.next = false;
    pages.prev = false;
    pages.first = false;
    pages.last = false;
  }

  return pages;
};

/*
 *  A Specific Piece of Content
 *
 * @param {object} query - Request queries
 * @param {string} id - The GUID to search
 * @param {array} model - Array of content type attributes
 * @param {function} trx - Database transaction object
 *
 * @returns {object} - All items and the pagination for the items
 */
// TODO: Return error if no items are found
const one = (query, id, model, models, trx) => {
  const db = trx || database;
  const params = _.cloneDeep(query) || {};

  // check that query has depth property
  if (!params.hasOwnProperty('depth') || isNaN(parseInt(params.depth, 10))) {
    params.depth = 0;
  }

  return db('live').select('*').where({
    id,
  }).then(rows => {
    return format(rows, model, models, params, db).then(fmtd => {
      const formatted = fmtd[0];

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
  });
};

module.exports = {
  attributes,
  format,
  organize,
  page,
  one,
};
