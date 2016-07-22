import test from 'ava';
import moment from 'moment';
import content from 'punchcard-content-types';

import workflows from '../lib/workflows';


const revision = {
  audit: '',
  approval: 2,
};

const approvedBody = {
  'action--select': 'approve',
  'comment--textarea': 'I approve this',
};

const rejectedBody = {
  'action--select': 'reject',
  'comment--textarea': 'No, just, no.',
};

const oneEntry = [
  {
    'comment': 'I approve this',
    'action': 'approve',
    'step': 2,
    'author': 123,
    'created': {
      'date': '2016-07-21',
      'time': '17:20',
      'zone': 'America/New_York'
    }
  }
]

const request = {
  body: approvedBody,
  user: {
    id: 123,
  },
};

const workflow = {
  name: 'Editor Approve',
  id: 'editor-approve',
  steps: [
    { name: 'Send to Legal' },
    { name: 'Send to Editor' },
    { name: 'Publish' },
  ],
};

test('Workflow functions', t => {
  // t.is(typeof workflows, 'function', 'Workflows exports a function');
  t.is(typeof workflows.raw, 'function', 'Submodule `raw` exists and is a function');
});

test('Workflows compiled into content type', t => {
  return content.raw().then(types => {
    t.true(types[0].hasOwnProperty('workflow'), 'Should have a workflow attribute');
  });
});

test('Workflows grabbed from yaml config', t => {
  return workflows.raw().then(flow => {
    t.is(flow[0].name, 'Editor Approve', 'Second workflow should exist');
    t.is(flow[0].id, 'editor-approve', 'Second workflow should exist');
    t.true(Array.isArray(flow[0].steps), 'Steps is an array');
    t.is(typeof flow[0].steps[0], 'object', 'Steps is an array');
    t.is(flow[1].name, 'Self Publish', 'Default should be self-publish');
    t.is(flow[1].id, 'self-publish', 'Default should be self-publish');
    t.true(Array.isArray(flow[1].steps), 'Steps is an array');
  });
});

test('create a default audit entry', t => {
  const entry = workflows.entry('', '', '', request);

  t.is(entry.comment, 'No comment', 'Should have comment');
  t.is(entry.action, 'No action', 'Should have action');
  t.is(entry.step, '', 'Should have no step number');
  t.is(entry.author, 123, 'Should be author id');
  t.is(typeof entry.created, 'object', 'Created should be an object');
  t.true(moment(entry.created.date, 'YYYY-MM-DD', true).isValid(), 'Should have a date');
  t.true(moment(entry.created.time, 'HH:mm', true).isValid(), 'Should have a time');
});

test('create an audit entry with variables', t => {
  const entry = workflows.entry('I love it', 'approve', 2, request);

  t.is(entry.comment, 'I love it', 'Should have comment');
  t.is(entry.action, 'approve', 'Should have action');
  t.is(entry.step, 2, 'Should have no step number');
  t.is(entry.author, 123, 'Should be author id');
  t.is(typeof entry.created, 'object', 'Created should be an object');
  t.true(moment(entry.created.date, 'YYYY-MM-DD', true).isValid(), 'Should have a date');
  t.true(moment(entry.created.time, 'HH:mm', true).isValid(), 'Should have a time');
});

test('Audit created from approval submission', t => {
  const audits = workflows.audits(revision, workflow, request);

  t.is(typeof audits.audit, 'object', 'Audit should be an object');
  t.true(Array.isArray(audits.audit.entries), 'Entries should be an array');
  t.is(typeof audits.approval, 'number', 'Approval should be a number');
  t.is(audits.approval, 1, 'Approval should reflect approval stage');
  t.is(typeof audits.publishable, 'boolean', 'Publishable should be boolean');
  t.is(audits.publishable, false, 'Publishable should be false');
  t.is(audits.audit.entries[0].comment, 'I approve this', 'Should retain comment');
  t.is(audits.audit.entries[0].action, 'approve', 'Should have action');
  t.is(audits.audit.entries[0].step, 1, 'Should be the step number');
  t.is(audits.audit.entries[0].author, 123, 'Should be author id');
  t.is(typeof audits.audit.entries[0].created, 'object', 'Should have created object');
});

test('Audit created from rejection', t => {
  const req = (JSON.parse(JSON.stringify(request)));
  req.body = rejectedBody;
  const audits = workflows.audits(revision, workflow, req);

  t.is(typeof audits.audit, 'object', 'Audit should be an object');
  t.true(Array.isArray(audits.audit.entries), 'Entries should be an array');
  t.is(typeof audits.approval, 'number', 'Approval should be a number');
  t.is(audits.approval, 2, 'Approval should reflect approval stage');
  t.is(typeof audits.publishable, 'boolean', 'Publishable should be boolean');
  t.is(audits.publishable, false, 'Publishable should be false');
  t.is(audits.audit.entries[0].comment, 'No, just, no.', 'Should retain comment');
  t.is(audits.audit.entries[0].action, 'reject', 'Should have action');
  t.is(audits.audit.entries[0].step, 2, 'Should be the step number');
  t.is(audits.audit.entries[0].author, 123, 'Should be author id');
  t.is(typeof audits.audit.entries[0].created, 'object', 'Should have created object');
});

test('Audit on content with one approval', t => {
  const rev = (JSON.parse(JSON.stringify(revision)));
  rev.approval = 1;
  const audits = workflows.audits(rev, workflow, request);

  t.is(typeof audits.audit, 'object', 'Audit should be an object');
  t.true(Array.isArray(audits.audit.entries), 'Entries should be an array');
  t.is(typeof audits.approval, 'number', 'Approval should be a number');
  t.is(audits.approval, 0, 'Approval should reflect approval stage');
  t.is(typeof audits.publishable, 'boolean', 'Publishable should be boolean');
  t.is(audits.publishable, true, 'Publishable should be false');
  t.is(audits.audit.entries[0].comment, 'I approve this', 'Should retain comment');
  t.is(audits.audit.entries[0].action, 'approve', 'Should have action');
  t.is(audits.audit.entries[0].step, 0, 'Should be the step number');
  t.is(audits.audit.entries[0].author, 123, 'Should be author id');
  t.is(typeof audits.audit.entries[0].created, 'object', 'Should have created object');
});