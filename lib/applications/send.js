'use strict';

const Promise = require('bluebird');
const moment = require('moment');
const request = require('request');

const database = require('../database');

/*
 * @typedef requestEndpoint
 * @type object
 *
 * @property {array} options - options for the Request module
 * @property {string} options.url - application endpoint url
 * @property {string} options.method - type of request
 * @property {object} options.json - request body
 * @property {string} options.json.id - client id
 * @property {string} options.json.secret - client secret
 */

/*
 * @typedef endpointResponse
 * @type object
 * Contains the response and timestamp for an endpoint request
 *
 * @property {date} timestamp - timestamp of request
 * @property {number} response - statusCode response from request
 */

/*
 * @typedef options
 * @type object
 * Application options is the object passed between each of these functions
 *
 * @property {string} trigger - one of live/sunset/updated
 * @property {array} apps - applications pulled from database
 * @property {array} endpoints - endpoints derived from apps (first added by `endpoints` function)
 * @property {string} endpoints.id - id of a given app (added by `endpoints` function)
 * @property {requestEndpoint} endpoints.options - see requestEndpoint typedef (added by `endpoints` function)
 * @property {endpointResponse} endpoints.response - see endpointResponse typedef (added during `send` Promise.resolve)
 */

/**
 * Creates an array from all application endpoints that match the trigger
 *
 * @param  {options} options - see options typedef
 *
 * @returns {options}  - see options typedef
 */
const endpoints = options => {
  const opts = options;

  return new Promise((resolve, reject) => {
    if (!Array.isArray(options.apps)) {
      reject('Apps must be an array');
    }

    opts.endpoints = options.apps.map(app => {
      if (app[`${options.trigger}-endpoint`] && app[`${options.trigger}-endpoint`] !== '') {
        return {
          id: app.id,
          options: {
            url: app[`${options.trigger}-endpoint`],
            method: 'POST',
            json: {
              id: app['client-id'],
              secret: app['client-secret'],
            },
          },
        };
      }

      return false;
    }).filter(Boolean);

    resolve(opts);
  });
};

/*
 * Promise wrapper for Request
 */
const req = options => {
  return new Promise((res) => {
    request(options, (err, response) => {
      let status;
      if (err) {
        res({
          response: 500,
          timestamp: moment().unix(),
        });
      }

      if (typeof response === 'object' && response.hasOwnProperty('statusCode')) {
        status = response.statusCode;
      }

      res({
        response: status || 500,
        timestamp: moment().unix(),
      });

      return true;
    });
  });
};

/*
 * Send request to endpoints
 *
 * @param {requestEndpoint} options - see requestEndpoint typedef
 *
 * @returns {endpointResponse} - see endpointResponse typedef
 */
const requests = options => {
  const opts = options;

  // grabs every promise for every endpoint
  const ends = opts.endpoints.map(en => {
    const end = en;

    return req(end.options).then(resp => {
      end.response = resp;

      return end;
    });
  });

  return Promise.all(ends).then(result => {
    opts.endpoints = result;

    return opts;
  });
};

/**
 * Updates database with responses from each endpoint
 *
 * @param  {options} options - see options typedef
 *
 * @returns {promise}  - knex transactions
 */
const save = options => {
  const ids = options.endpoints.map(end => {
    return end.id;
  }).filter(id => {
    if (typeof id !== 'undefined') {
      return true;
    }

    return false;
  });

  return database.transaction(trx => {
    return trx('applications')
      .select('id', 'responses')
      .whereIn('id', ids)
      .then(aps => {
        const apps = aps.map(app => {
          let responses = app.responses;

          // make sure responses is an object
          if (responses === null || typeof responses !== 'object') {
            responses = {};
          }

          // check that this trigger exists/is array, make an array if not
          if (!responses.hasOwnProperty(options.trigger) || !Array.isArray(responses[options.trigger])) {
            responses[options.trigger] = [];
          }

          const endpoint = options.endpoints.find((end) => {
            return end.id === app.id;
          });

          // add response from endpoint
          responses[options.trigger].push(endpoint.response);

          return trx('applications').where('id', '=', app.id).update('responses', responses).returning(['*']);
        });

        return Promise.all(apps);
      });
  });
};

/**
 * Send to application endpoints
 * @param  {options} options - see options typedef
 *
 * @returns {Promise} - promise results in an array of changed applications
 */
const send = options => {
  return Promise.resolve(options)
    .then(endpoints)
    .then(requests)
    .then(save);
};

module.exports = send;
module.exports.endpoints = endpoints;
module.exports.request = req;
module.exports.save = save;
