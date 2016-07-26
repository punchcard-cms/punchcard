import test from 'ava';
import moment from 'moment';
import path from 'path';
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

const request = {
  body: approvedBody,
  user: {
    id: 123,
    role: 'admin',
    access: null,
    email: 'important@person.com',
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
  t.is(typeof workflows.audits, 'function', '`audits` exists and is a function');
  t.is(typeof workflows.utils.check, 'function', '`check` exists and is a function');
  t.is(typeof workflows.entry, 'function', '`entry` exists and is a function');
  t.is(typeof workflows.model, 'function', '`model` exists and is a function');
  t.is(typeof workflows.raw, 'function', '`raw` exists and is a function');
  t.is(typeof workflows.model.structure, 'object', '`raw` exists and is an object');
});

test('Workflows compiled into content type', t => {
  return content.raw().then(types => {
    t.true(types[0].hasOwnProperty('workflow'), 'Should have a workflow attribute');
  });
});

//////////////////////////////
// Workflows - workflow object structure
//////////////////////////////
test('Workflow structure object', t => {
  const structure = workflows.model.structure;

  t.is(typeof structure, 'object', 'Structure is an object');
  t.is(structure.name, 'Workflow', 'Structure has name');
  t.is(structure.description, 'A workflow entry', 'Structure has description');
  t.is(structure.id, 'workflow', 'Structure has id');
  t.true(Array.isArray(structure.attributes), 'attributes is an array');
});

//////////////////////////////
// Workflows - model
//////////////////////////////
test('Workflow model', t => {
  return workflows.model().then(model => {
    t.true(model[0].hasOwnProperty('name'), 'Should have a workflow attribute');
    t.is(model[0].name, 'Workflow', 'Structure has name');
  });
});

test('Workflow model from config', t => {
  const structure = workflows.model.structure;
  structure.name = 'Other';

  return workflows.model(structure).then(model => {
    t.true(model[0].hasOwnProperty('name'), 'Should have a workflow attribute');
    t.is(model[0].name, 'Other', 'Structure has name');
  });
});

//////////////////////////////
// Workflows - workflow object checking
//////////////////////////////
test('Workflow config check name', t => {
  const check = workflows.utils.check({});
  t.is(check, 'Workflows require a name', 'Workflows require a name');
});

test('Workflow config check name string', t => {
  const wf = {
    name: [],
  };
  const check = workflows.utils.check(wf);
  t.is(check, 'Workflows name must be string', 'Workflows name must be string');
});

test('Workflow config check name', t => {
  const wf = {
    name: 'test',
  };
  const check = workflows.utils.check(wf);
  t.is(check, 'Workflows require an id', 'Workflows require an id');
});

test('Workflow config id kebab', t => {
  const wf = {
    name: 'test',
    id: 'kebabThingy',
  };
  const check = workflows.utils.check(wf);
  t.is(check, 'kebabThingy needs to be written in kebab case (e.g. kebabthingy)', 'Workflows id needs to be kebab');
});

test('Workflow config check steps exists', t => {
  const wf = {
    name: 'test foo',
    id: 'test-foo',
  };
  const check = workflows.utils.check(wf);
  t.is(check, 'A workflow must have steps', 'A workflow must have steps');
});

test('Workflow config check steps is an array', t => {
  const wf = {
    name: 'test',
    id: 'test',
    steps: 'steps',
  };
  const check = workflows.utils.check(wf);
  t.is(check, 'Workflow steps must be an array', 'Workflow steps must be an array');
});

test('Workflow config check at least one step', t => {
  const wf = {
    name: 'test',
    id: 'test',
    steps: [],
  };
  const check = workflows.utils.check(wf);
  t.is(check, 'Workflow must have at least one step', 'Workflow should have at least one step');
});

test('Workflow config check step requires name', t => {
  const wf = {
    name: 'test',
    id: 'test',
    steps: [{}],
  };
  let check = workflows.utils.check(wf);
  t.is(check, 'Step must have a name', 'Workflow steps require a name');

  wf.steps = [{
    name: 'foo',
  }, {
    name: '',
  }];
  check = workflows.utils.check(wf);
  t.is(check, 'Step must have a name', 'Workflow steps require a name');
});

test('Workflow config check step self is boolean', t => {
  const wf = {
    name: 'test',
    id: 'test',
    steps: [{
      name: 'foo',
      self: 'foo',
    }],
  };
  let check = workflows.utils.check(wf);
  t.is(check, 'Self-publish must be a boolean', 'Workflow self-publish must be boolean');

  wf.steps = [{
    name: 'foo',
    self: true,
  }, {
    name: 'foo',
    self: 'foo',
  }];
  check = workflows.utils.check(wf);
  t.is(check, 'Self-publish must be a boolean', 'Workflow self-publish must be boolean');
});

//////////////////////////////
// Workflows - loading workflow files
//////////////////////////////
test('Workflows rejects bad config', t => {
  const badpath = path.join(__dirname, './fixtures/workflows/bad-name');

  return workflows.raw(badpath).then(() => {
    t.fail('Raw should fail');
  }).catch(e => {
    t.is(e.message, 'Workflows name must be string', 'Workflows name must be string');
  });
});

test('Workflows cannot share id', t => {
  const badpath = path.join(__dirname, './fixtures/workflows/same-id');

  return workflows.raw(badpath).then(() => {
    t.fail('Raw should fail');
  }).catch(e => {
    t.is(e.message, 'Workflow samesame is duplicated!', 'No same id on workflows');
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

//////////////////////////////
// Workflows - entry
//////////////////////////////
test('create a default audit entry', t => {
  const entry = workflows.entry('', '', '', request);

  t.is(entry.comment, 'No comment', 'Should have comment');
  t.is(entry.action, 'No action', 'Should have action');
  t.is(entry.step, '', 'Should have no step number');
  t.is(typeof entry.author, 'object', 'Author should be an object');
  t.is(entry.author.id, 123, 'Should be an author id');
  t.is(entry.author.role, 'admin', 'Should be an author role');
  t.is(entry.author.email, 'important@person.com', 'Should be an author email');
  t.is(entry.author.access, null, 'Should be an author role');
  t.is(typeof entry.created, 'object', 'Created should be an object');
  t.true(moment(entry.created.date, 'YYYY-MM-DD', true).isValid(), 'Should have a date');
  t.true(moment(entry.created.time, 'HH:mm', true).isValid(), 'Should have a time');
});

test('create an audit entry with variables', t => {
  const entry = workflows.entry('I love it', 'approve', 2, request);

  t.is(entry.comment, 'I love it', 'Should have comment');
  t.is(entry.action, 'approve', 'Should have action');
  t.is(entry.step, 2, 'Should have no step number');
  t.is(typeof entry.author, 'object', 'Author should be an object');
  t.is(entry.author.id, 123, 'Should be an author id');
  t.is(typeof entry.created, 'object', 'Created should be an object');
  t.true(moment(entry.created.date, 'YYYY-MM-DD', true).isValid(), 'Should have a date');
  t.true(moment(entry.created.time, 'HH:mm', true).isValid(), 'Should have a time');
});

//////////////////////////////
// Workflows - audits
//////////////////////////////
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
  t.is(typeof audits.audit.entries[0].author, 'object', 'Author should be an object');
  t.is(audits.audit.entries[0].author.id, 123, 'Should be an author id');
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
  t.is(typeof audits.audit.entries[0].author, 'object', 'Author should be an object');
  t.is(audits.audit.entries[0].author.id, 123, 'Should be an author id');
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
  t.is(typeof audits.audit.entries[0].author, 'object', 'Author should be an object');
  t.is(audits.audit.entries[0].author.id, 123, 'Should be an author id');
  t.is(typeof audits.audit.entries[0].created, 'object', 'Should have created object');
});


test('workflows in type', t => {
  const type = {
    workflow: 'editor-approve',
  };

  const allFlows = [
    {
      'name': 'Editor Approve',
      'id': 'editor-approve',
      'steps': [
        {
          'name': 'Publish',
          'self': true,
        },
        {
          'name': 'Editor Approval',
        },
      ],
    },
  ];

  const globalConfig = {
    content: {
      base: '/',
    },
    workflows: {
      default: 'self-publish',
      messages: {
        missing: 'Workflow \'%workf\' for Content Type \'%type\' not found',
      },
    },
  };

  const expected = {
    name: 'Editor Approve',
    id: 'editor-approve',
    steps: [
      {
        name: 'Publish',
        self: true,
      },
      {
        name: 'Editor Approval',
      },
    ],
  };
  const req = {
    params: {
      type: 'services',
    },
    session: {},
    workflow: 'editor-approve',
  };
  const wf = workflows.workflow(type, allFlows, globalConfig, req);

  // get type workflow
  t.is(JSON.stringify(wf), JSON.stringify(expected), 'Grabs an existing workflow');

  // bad workflow in type
  const badtype = (JSON.parse(JSON.stringify(type)));
  badtype.workflow = 'nope';
  const badflow = workflows.workflow(badtype, allFlows, globalConfig, req);
  t.is(badflow, false, 'Returns false on workflow missing from global flows');

  // no flow in type
  const noflow = (JSON.parse(JSON.stringify(type)));
  noflow.workflow = '';
  const nopeflow = workflows.workflow(noflow, allFlows, globalConfig, req);

  t.is(nopeflow, false, 'Returns false on workflow missing from global flows');
});
