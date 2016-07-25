'use strict';

const schemas = require('../database/schemas');
const utils = require('../utils');

const liveSchema = utils.singleItem('name', 'live', schemas).fields.map(field => {
  return field.name;
});

/*
 * Formats raw live data in to consumable returns
 *
 * @param {array} content - Array of objects representing the raw DB query of content
 * @param {boolean} attrs - If `true` included, will include attributes instead of meta
 *
 * @returns {array} - formatted object of content
 */
const format = (content, attrs) => {
  return content.map(item => {
    const result = {
      id: item.id,
      type: item.type,
      type_slug: item['type-slug'], // eslint-disable-line camelcase
      key: item.key,
      key_slug: item['key-slug'], // eslint-disable-line camelcase
    };

    if (attrs) {
      result.attributes = item.attributes;
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

module.exports = {
  format,
  organize,
  page,
};
