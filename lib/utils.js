'use strict';

const util = require('util');
const moment = require('moment-timezone');

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
 * Formats raw data from form to object
 *
 * @param {object} body - Raw data object
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
      let i = 0;
      while (i < data[key].length) {
        let empty = true;
        Object.keys(data[key][i]).forEach(type => {
          if (data[key][i][type].value != null && data[key][i][type].value != "" && data[key][i][type].value != []) {
            empty = false;
          }
        });
        if (empty == true) {
          data[key].splice(i);
        }
        else {
          i++;
        }
      }
    }
  });

  return data;
};

module.exports = {
  singleItem,
  log,
  time,
  config,
  format,
};
