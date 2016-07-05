'use strict';


const loader = require('./workflows/load');

/**
 * Get all Workflows
 *
 * @returns {Promise} - An {Array} containing {Object} for each workflow, including `name` {String}, `id` name {String}, and full config {Object} loaded from YAML config file
 */
const raw = loader;

module.exports = {};
module.exports.raw = raw;
