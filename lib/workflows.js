/**
 *  @fileoverview User functions index
 *
 *  @author  Scott Nath
 *
 */
'use strict';

const load = require('./workflows/load');
const data = require('./workflows/data');

module.exports = data;

/**
 * Get all Workflows
 *
 * @returns {Promise} - An {Array} containing {Object} for each workflow, including `name` {String}, `id` name {String}, and steps {Object} loaded from YAML config file
 */
module.exports.raw = load;
