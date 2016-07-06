/**
 *  @fileoverview User functions index
 *
 *  @author  Scott Nath
 *
 */
'use strict';

const loader = require('./workflows/load');
const model = require('./workflows/data');

module.exports = model;

/**
 * Get all Workflows
 *
 * @returns {Promise} - An {Array} containing {Object} for each workflow, including `name` {String}, `id` name {String}, and steps {Object} loaded from YAML config file
 */
const raw = loader;

module.exports.raw = raw;
