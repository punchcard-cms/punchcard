import test from 'ava';
import del from 'del';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import storage from '../lib/storage';
import fixtures from './fixtures/files';

test.after.always(() => {
  return del(['public']);
});

test('Storage - Default', t => {
  const input = fixtures.raw();

  return storage.put(input).then(files => {
    t.is(Object.keys(files).length, input.length, 'Same number of files came out as went in');

    Object.keys(files).forEach(file => {
      const result = files[file];
      const expected = input.find(inp => {
        return inp.fieldName === file;
      });

      t.true(result.hasOwnProperty('_uuid'), 'Has a UUID');
      t.true(result.hasOwnProperty('_type'), 'Has a type');
      t.true(result.hasOwnProperty('_rel'), 'Has a relative path');
      t.is(result.type, expected.type, 'Have the same type');
      t.is(result.stat.size, expected.size, 'Same size files');
      t.is(result.rel, path.basename(result.path), 'Relative URL is the same as basename of path');

      const output = fs.readFileSync(result.path);
      const original = fs.readFileSync(expected.path);

      t.is(output.toString(), original.toString(), 'Output and original are the same file');
    });
  }).catch(e => {
    console.error(e.stack);
    t.fail();
  });
});

test('Storage - Get', t => {
  const input = fixtures.saved();
  const results = storage.get(_.cloneDeep(input));

  t.true(input.length === results.length, 'Equal number of inputs and results');

  input.forEach(expected => {
    const result = results.find(r => {
      return r.name === expected.name;
    });

    if (result === false) {
      t.fail('No result for input item');
    }

    t.true(result.hasOwnProperty('name'), 'Result has a name');
    t.true(result.hasOwnProperty('path'), 'Result has a path');
    t.true(result.hasOwnProperty('type'), 'Result has a type');

    t.is(result.name, expected.name, 'Result name is same as expected name');
    t.is(result.type, expected.type, 'Result type is same as expected type');

    t.true(result.path.indexOf(expected.path) >= 0, 'Result path contains expected path');
  });

  t.pass();
});
