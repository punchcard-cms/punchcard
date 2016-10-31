'use strict';

const _ = require('lodash');

const database = require('../database');
const schemas = require('../database/schemas');
const utils = require('../utils');

const liveSchema = utils.singleItem('name', 'live', schemas).fields.map(field => {
  return field.name;
});

/*
 * Formats raw attributes in to API output
 *
 * @param {array} attrs - Array of objects representing the raw attribute content
 * @param {array} model - Array of objects representing the content type's attribute model
 */
const attributes = (attrs, model) => {
  const result = {};

  model.forEach(input => {
    if (!input.hasOwnProperty('repeatable')) {
      const inputs = Object.keys(input.inputs);
      const total = Object.keys(inputs).length;

      if (total === 1) {
        result[input.id] = _.get(attrs, `${input.id}.${inputs[0]}.value`, null);
      }
      else {
        result[input.id] = {};

        inputs.forEach(inp => {
          result[input.id][inp] = _.get(attrs, `${input.id}.${inp}.value`, null);
        });
      }
    }
    else {
      const inputs = Object.keys(input.inputs[0]);
      const total = Object.keys(inputs).length;

      if (_.has(attrs, input.id)) {
        let items = _.get(attrs, input.id, []);

        if (!Array.isArray(items)) {
          items = [items];
        }

        result[input.id] = items.map(item => {
          if (total === 1) {
            return _.get(item, `${inputs[0]}.value`, null);
          }

          const repeat = {};

          inputs.forEach(inp => {
            repeat[inp] = _.get(item, `${inp}.value`, null);
          });

          return repeat;
        });
      }
      else {
        result[input.id] = null;
      }
    }
  });

  return result;
};

/*
 * Formats raw live data in to consumable returns
 *
 * @param {array} content - Array of objects representing the raw DB query of content
 * @param {object} model - If included, will include attributes instead of meta, built off of the attribute definition passed in
 *
 * @returns {array} - formatted object of content
 */
const format = (content, model) => {
  return content.map(item => {
    const result = {
      id: item.id,
      type: item.type,
      type_slug: item['type-slug'], // eslint-disable-line camelcase
      key: item.key,
      key_slug: item['key-slug'], // eslint-disable-line camelcase
    };

    if (model) {
      result.attributes = attributes(item.attributes, model);
    }
    else {
      result.meta = {
        url: `/api/types/${item['type-slug']}/${item.id}`,
      };
    }

    return result;
  });
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
const one = (query, id, model, trx) => {
  const db = trx || database;

  return db('live').select('*').where({
    id,
  }).then(rows => {
    const formatted = format(rows, model)[0];

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
  attributes,
  format,
  organize,
  page,
  one,
};
