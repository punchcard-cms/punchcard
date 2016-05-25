/**
 *  @fileoverview User functions index
 *
 *  @author  Scott Nath
 *
 */
'use strict';

const model = require('./users/data');
const routes = require('./users/routes');

module.exports = model;
module.exports.routes = routes;
