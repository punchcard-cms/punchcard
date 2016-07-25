'use strict';

const _ = require('lodash');
const utils = require('../utils');

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
 * @returnss {AuditEntry} audit entry
 */
const entry = (comment, action, step, req) => {
  const etry = {
    comment,
    action,
    step,
    author: req.user,
    created: utils.time.input(Date.now(), 'America/New_York'),
  };

  if ((typeof etry.comment !== 'string') || (!etry.comment)) {
    etry.comment = 'No comment';
  }

  if ((typeof etry.action !== 'string') || (!etry.action)) {
    etry.action = 'No action';
  }

  return etry;
};

/*
 * @typedef Audit
 * @type object
 *
 * @property {AuditEntry} audit entry
 * @property {number} approval  step in workflow process
 * @property {boolean} publishable  is content publishable?
 */


/*
 * audits
 *
 * @param {object} revision a content revision
 * @param {object} workflow a workflow
 * @param {object} req - HTTP Request
 *
 * @returns {Audit} audit object for db entry
 */
const audits = (revision, workflow, req) => {
  const rev = revision;
  const comment = req.body['comment--textarea'];
  let publishable = false;
  let auds = rev.audit;
  let step;

  // no flow entries exist
  if (!auds || (typeof auds !== 'object')) {
    auds = { entries: [] };
  }

  const action = req.body['action--select'];
  step = rev.approval;
  if (action === 'approve') {
    step--;
  }

  const approval = step;

  // Add the entry to existing audits
  auds.entries.push(entry(comment, action, step, req));

  // if approval is zero, it's publishable
  if (approval === 0) {
    publishable = true;
  }

  return {
    audit: auds,
    approval,
    publishable,
  };
};


/**
 * Get a single workflow from all workflows available
 *
 * @param {object} type - a content type object
 * @param {object} allflows - an object of all workflows
 * @param {object} globalConfig - global configuration
 * @param {object} req - HTTP Request
 *
 * @returns {object} single workflow object
 */
const workflow = (type, allflows, globalConfig, req) => {
  let wf;
  if (type.workflow) {
    wf = utils.singleItem('id', type.workflow, allflows);

    if (wf === false) {
      _.set(req.session, '404', {
        message: globalConfig.workflows.messages.missing.replace('%type', req.params.type).replace('%workflow', type.workflow),
        safe: `/${globalConfig.content.base}`,
      });

      return false;
    }
  }
  else {
    wf = utils.singleItem('id', globalConfig.workflows.default, allflows);
  }

  return wf;
};

module.exports = workflow;
module.exports.audits = audits;
module.exports.entry = entry;
