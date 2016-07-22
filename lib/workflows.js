/**
 *  @fileoverview User functions index
 *
 *  @author  Scott Nath
 *
 */
'use strict';
const load = require('./workflows/load');
const model = require('./workflows/model');
const workflow = require('./workflows/workflow');


module.exports = {
  audits: workflow.audits,
  entry: workflow.entry,
  model,
  raw: load,
  structure: model.structure,
};
