import test from 'ava';
import content from 'punchcard-content-types';
import workflows from '../lib/workflows';

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
