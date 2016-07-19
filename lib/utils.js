'use strict';

const util = require('util');
const moment = require('moment-timezone');
const schemas = require('./database/schemas');

moment.tz.setDefault('UTC');

/*
 * Filters an array of objects based on the value of a key in the objects
 *
 * @param {string} key - The key in the object to check
 * @param {string} value - The value to check against
 * @param {array} arr - An array of {Object}s
 *
 * @returns {object|boolean} - Will return the first filtered object, or `false` if no objects match
 */
const singleItem = (key, value, arr) => {
  const filtered = arr.filter(type => {
    if (type[key] === value) {
      return true;
    }

    return false;
  });

  if (filtered.length === 0) {
    return false;
  }

  return filtered[0];
};

/*
 * Logs out full object
 *
 * @param {object|string} object - The object to be logged
 */
/* istanbul ignore next */
const log = (object) => {
  // Mean to console.log out, so disabling
  console.log(util.inspect(object, false, null)); // eslint-disable-line no-console
};

/*
 * Formats string date components in to ISO date
 *
 * @param {string} date - The date to be transformed
 * @param {string} time - The time to be transformed
 * @param {string} zone - The timezone the date and time are in (e.g. America/New_York)
 *
 * @returns {string} - An ISO formatted date in GMT
 */
const isoTime = (date, time, zone) => {
  if (date === '' || date === undefined || time === '' || time === undefined || zone === '' || zone === undefined) {
    return null;
  }

  const converted = moment.tz(`${date} ${time}`, zone);

  return converted.toISOString();
};

/*
 * @typedef FormattedDate
 * @type object
 *
 * @property {string} date - The date, formatted YYYY-MM-DD (e.g. 2016-05-25)
 * @property {string} time - The time, formatted HH:mm (e.g. 13:01)
 * @property {string} zone - The time zone, formatted Z (e.g. America/New_York)
 */

/*
 * Formats ISO date in to requisite components
 *
 * @param {string} date - ISO UTC formatted date
 * @param {string} zone - Timezone to retrieve date in
 *
 * @returns {FormattedDate} - The individually formatted date components
 */
const inputTime = (date, zone) => {
  let tz = zone;

  if (date === '' || date === undefined) {
    return null;
  }

  if (typeof tz === 'undefined') {
    tz = 'UTC';
  }

  return {
    date: moment(date).tz(tz).format('YYYY-MM-DD'),
    time: moment(date).tz(tz).format('HH:mm'),
    zone: tz,
  };
};

const time = {
  iso: isoTime,
  input: inputTime,
};


/*
 * Generate Config Object for Only
 */
const config = values => {
  const result = {};

  Object.keys(values).map(value => {
    const split = value.split('--');
    const plugin = split[0];
    const input = split[1];

    // Repeat
    // const index = split[2];

    if (!result.hasOwnProperty(plugin)) {
      result[plugin] = {};
    }

    result[plugin][input] = {
      value: values[value],
    };
  });

  return result;
};

/*
 * @typedef RequestBody
 * @type object
 *
 * @property {string | array} input - inputName--inputType : value
 */

/*
 * @typedef FormattedBody
 * @type object
 *
 * @property {string} FormattedBody.name - Name of the input
 * @property {object | array} FormattedBody.name.type - Type of the input
 * @property {string} FormattedBody.name.type.value - Value of the input
 */

/*
 * Formats raw data from form to object
 *
 * @param {RequestBody} body - inputName--inputType: value
 *
 *
 * @returns {object} - formatted object of data
 */
const format = body => {
  const data = {};
  Object.keys(body).forEach(key => {
    if ((key === 'sunset-date') || (key === 'sunset-time') || (key === 'sunrise-date') || (key === 'sunrise-time')) {
      data[key] = {
        'value': body[key],
      };
    }
    else {
      const inputs = key.split('--');
      const inputName = inputs[0];
      const inputType = inputs[1];

      // Checks if multiple instances
      if (inputs.length >= 3) {
        const index = inputs[2];
        if (!data.hasOwnProperty(inputName)) {
          // Creates an array for multiple instances
          data[inputName] = [];
        }
        if (!data[inputName][index]) {
          // Create an object for instance
          data[inputName][index] = {};
        }

        // Sets value of input
        data[inputName][index][inputType] = { 'value': body[key] };
      }
      else {
        if (!data.hasOwnProperty(inputName)) {
          data[inputName] = {};
        }
        data[inputName][inputType] = { 'value': body[key] };
      }
    }
  });

  // Deletes the empty instances
  Object.keys(data).forEach(key => {
    if (Array.isArray(data[key])) {
      data[key] = data[key].filter(input => {
        return Object.keys(input).filter(type => {
          if (input[type].value !== null && input[type].value !== '' && input[type].value !== []) {
            return true;
          }

          return false;
        }).length > 0;
      });
      if (data[key].length === 1) {
        data[key] = data[key][0];
      }
    }
  });

  return data;
};

/*
 * Formats raw live data in to consumable returns
 *
 * @param {array} content - Array of objects representing the raw DB query of content
 *
 * @returns {array} - formatted object of content
 */
const formatAPI = (content, attrs) => {
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
 * @param {object} params - Request parameters
 *
 * @returns {object} - Object with sort key, sort direction, pagination count and offset
 */
const liveSchema = singleItem('name', 'live', schemas).fields.map(field => {
  return field.name;
});

const organizeAPI = (params, lookup) => {
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
 * @param {object} organize - Organized sort and pagination
 * @param {number} count - Total number of items
 */
const pageAPI = (base, organize, count) => {
  const baseURL = `/${base}?sort=${organize.sort.by}&sort_dir=${organize.sort.dir}&per_page=${organize.page.limit}`;
  const pages = {
    first: `${baseURL}&page=1`,
  };
  let total = Math.floor(count / organize.page.limit);
  if (count % organize.page.limit !== 0) {
    total += 1;
  }

  // If not the first page, add a previous link
  if (organize.page.page !== 1) {
    pages.prev = `${baseURL}&page=${organize.page.page - 1}`;
  }
  else {
    pages.prev = false;
  }

  // Add next link if not on the last page
  if (organize.page.page + 1 <= total) {
    pages.next = `${baseURL}&page=${organize.page.page + 1}`;
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

  return pages;
};

module.exports = {
  api: { // TODO: Tests
    format: formatAPI,
    organize: organizeAPI,
    pagination: pageAPI,
  },
  singleItem,
  log,
  time,
  config,
  format,
};
