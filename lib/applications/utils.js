'use strict';

/**
 * @fileoverview Applications utility functions
 *
 */
const _ = require('lodash');

const endpoints = rw => {
  const row = rw || {};
  row.endpoints = {
    live: [],
    updated: [],
    sunset: [],
  };
  if (_.get(row, 'responses.endpoints', false) && Array.isArray(row.responses.endpoints)) {
    row.responses.endpoints.forEach(endpoint => {
      row.endpoints.live.push({
        response: _.get(endpoint, 'live.response', ''),
        timestamp: _.get(endpoint, 'live.timestamp', ''),
      });
      row.endpoints.updated.push({
        response: _.get(endpoint, 'updated.response', ''),
        timestamp: _.get(endpoint, 'updated.timestamp', ''),
      });
      row.endpoints.sunset.push({
        response: _.get(endpoint, 'sunset.response', ''),
        timestamp: _.get(endpoint, 'sunset.timestamp', ''),
      });
    });
  }

  row.client = {
    id: row['client-id'],
    secret: row['client-secret'],
  };

  return row;
};

module.exports = {
  endpoints,
};
