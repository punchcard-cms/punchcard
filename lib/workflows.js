/**
 *  @fileoverview User functions index
 *
 *  @author  Scott Nath
 *
 */
'use strict';
const database = require('./database');
const utils = require('./utils');
const load = require('./workflows/load');
const data = require('./workflows/data');


/*
 * @typedef AuditEntry
 * @type object
 *
 * @property {string} comment approver's comment
 * @property {string} action  action taken.
 * @property {number} step  current step in workflow
 * @property {number} author  author of audit entry
 * @property {FormattedDate} - The individually formatted date components
 */

/*
 * An audit entry
 *
 * @param {string} comment approver's comment
 * @param {string} action  action taken.
 * @param {number} step  current step in workflow
 * @param {object} req - HTTP Request
 *
 * @returns {AuditEntry} audit entry
 */
const entry = (comment, action, step, req) => {
  const data = {
    comment,
    action,
    step,
    author: req.user.id,
    created: utils.time.input(Date.now(), 'America/New_York'),
  };

  if ((typeof data.comment !== 'string') || (!data.comment)) {
    data.comment = 'No comment';
  }

  if ((typeof data.action !== 'string') || (!data.action)) {
    data.action = 'No action';
  }

  return data;
}

/*
 * audits
 *
 * @params {object} revision
 */
const audits = (revision, workflow, req) => {
  const rev = revision;
  const comment = req.body['comment--textarea'];
  let audits = rev.audit;
  let step;
  let approval;
  let publishable = false;
  let action;

  // no flow entries exist
  if (!audits || (typeof audits !== 'object')) {
    audits = { entries: [] };
  }

  action = req.body['action--select'];
  step = rev.approval;
  if (action === 'approve') {
    step--;
  }

  approval = step;

  // Add the entry to existing audits
  audits.entries.push(entry(comment, action, step, req));

  // if approval is zero, it's publishable
  if (approval === 0) {
    publishable = true;
  }

  return {
    audit: audits,
    approval,
    publishable,
  };
}

module.exports = data;

module.exports = {
  raw: load,
  audits,
  entry,
};
