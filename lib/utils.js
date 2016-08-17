'use strict';

const util = require('util');
const moment = require('moment-timezone');
const content = require('./content/utils');
const routes = require('./routes/utils');
const _ = require('lodash');
const Promise = require('bluebird');

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
  const single = Object.keys(body).filter(input => {
    if ((input === 'sunset-date') || (input === 'sunset-time') || (input === 'sunrise-date') || (input === 'sunrise-time')) {
      data[input] = { 'value': body[input] };

      return false;
    }
    if (input.split('--').length < 3) {
      return true;
    }

    return false;
  });
  const multiple = Object.keys(body).filter(input => {
    if (input.split('--').length >= 3) {
      return true;
    }

    return false;
  });

  single.forEach(input => {
    const inputs = input.split('--');
    const inputName = inputs[0];
    const inputType = inputs[1];
    if (!data.hasOwnProperty(inputName)) {
      // Creates an object for single instance
      data[inputName] = {};
    }
    data[inputName][inputType] = { 'value': body[input] };
  });

  multiple.forEach(input => {
    const inputs = input.split('--');
    const inputName = inputs[0];
    const inputType = inputs[1];
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
    data[inputName][index][inputType] = { 'value': body[input] };
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

      // Delete empty arrays
      if (data[key].length === 0) {
        delete data[key];
      }
    }
  });

  return data;
};

/*
 * @typedef Reference
 * @type object
 *
 * @property {type} Reference.id - Id of the content type
 * @property {attr} Reference.attr - Attribute Index
 * @property {input} Reference.input - Input of the reference
 * @property {length} Reference.length - Number of instances
 * @property {ct.id} Reference.ct.id - Id of the referenced content type
 * @property {ct.index} Reference.ct.index - Position of the reference content type
 */

/*
 * Inititalizes reference
 *
 * @param {object} types - content types object
 *
 *
 * * @returns {object} - content type and reference data
 */
const references = (types) => {
  const cts = _.cloneDeep(types);
  const refs = [];
  const position = {};

  // Saves position of each content type
  cts.forEach((type, index) => {
    if (!position.hasOwnProperty(type.id)) {
      position[type.id] = index;
    }
  });

  // Iterates through each content type and attributes
  cts.forEach(ct => {
    ct.attributes.forEach((attr, index) => {
      let inputs;
      let length;

      // Get the number of instances if repeatable
      if (Array.isArray(attr.inputs)) {
        inputs = attr.inputs[0];
        length = attr.inputs.length;
      }
      else {
        inputs = attr.inputs;
      }

      // Iterate through each inputs
      Object.keys(inputs).forEach(input => {
        // Checks if input is a reference
        if (inputs[input].hasOwnProperty('reference') && inputs[input].reference === true) {
          // Throw error if contentType is not defined
          if (!_.get(inputs[input], 'settings.contentType')) {
            throw new Error('Reference must have a content type');
          }

          if (!position.hasOwnProperty(inputs[input].settings.contentType)) {
            throw new Error(`Content Type ${inputs[input].settings.contentType} is not valid`);
          }

          if (_.get(inputs[input], 'settings.view') === 'radio') {
            inputs[input].type = 'radio';
          }

          // Defines and push reference object
          refs.push({
            type: ct.id,
            attr: index,
            input,
            length,
            ct: inputs[input].settings.contentType,
          });
        }
      });
    });
  });

  return {
    cts,
    references: refs,
  };
};


/*
 * Fills in content type data from database
 *
 * @param {object} types - content types object
 * @param {object} type - content type
 * @param {array} refs - reference data
 * @param {object} database - database object
 *
 *
 * @returns {object} - content type object with reference data
 */
const fill = (types, type, refs, database) => {
  const ct = _.cloneDeep(type);
  if (!ct) {
    return new Promise(resolve => {
      resolve(ct);
    });
  }
  const ref = refs.filter(reference => {
    return ct.id === reference.type;
  });

  return Promise.map(ref, input => {
    // subquery for select
    const where = database
          .max('revision')
          .from(`content-type--${input.ct}`)
          .groupBy('id');

    // Get the records from content-type
    return database
      .select('id', 'revision', 'value')
      .from(`content-type--${input.ct}`)
      .whereIn('revision', where).then(rws => {
        // stores referred type
        const ref = types.find((type) => {
          return type.id === input.ct;
        })
        const rows = routes.identifier(rws, ref);
        const options = rows.map(row => {
          return {
            value: row.id,
            label: row.identifier,
          };
        });

        // If repeatables set options for each instance
        if (input.length) {
          for (let i = 0; i < input.length; i++) {
            ct.attributes[input.attr].inputs[i][input.input].options = options;
          }
        }
        else {
          ct.attributes[input.attr].inputs[input.input].options = options;
        }
      });
  }).then(() => {
    return ct;
  });
};

module.exports = {
  content,
  routes,
  singleItem,
  log,
  time,
  config,
  format,
  fill,
  references,
};
