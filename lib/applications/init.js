'use strict';

const applications = require('./index');
const database = require('../database');

/**
 * Grabbing application's merged model and actual applications
 *
 * @returns {object} object contains merged applications model and all applications in system
 * @returns {object} object.merged merged applications model
 * @returns {array} object.apps array of all applications
 */
const init = () => {
  const results = {};

  return applications.model().then(merged => {
    results.merged = merged[0];

    return database('applications').select('*').orderBy('name', 'DESC');
  }).then(rows => {
    return rows.map(rw => {
      const row = rw;
      row.client = {
        id: row['client-id'],
        secret: row['client-secret'],
      };

      return row;
    });
  }).then(apps => {
    results.apps = apps;

    return results;
  });
};

module.exports = init;
