'use strict';

const util = require('util');
const dateFormat = require('dateformat');

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
 * @param {string} zone - The timezone the date and time are in
 *
 * @returns {string} - An ISO formatted date in GMT
 */
const isoTime = (date, time, zone) => {
  if (date === '' || date === undefined || time === '' || time === undefined || zone === '' || zone === undefined) {
    return null;
  }

  return dateFormat(`${date}, ${time} ${zone}`, 'isoDateTime');
};

/*
 * @typedef FormattedDate
 * @type object
 *
 * @property {string} date - The date, formatted YYYY-MM-DD (e.g. 2016-05-25)
 * @property {string} time - The time, formatted HH:MM (e.g. 13:01)
 * @property {string} zone - The time zone, formatted Z (e.g. EDT)
 */

/*
 * Formats ISO date in to requisite components
 *
 * @param {string} date - ISO formatted date
 *
 * @returns {FormattedDate} - The individually formatted date components
 */
const inputTime = date => {
  if (date === '' || date === undefined) {
    return null;
  }

  return {
    date: dateFormat(date, 'yyyy-mm-dd'),
    time: dateFormat(date, 'HH:MM'),
    zone: dateFormat(date, 'Z'),
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


module.exports = {
  singleItem,
  log,
  time,
  config,
};
