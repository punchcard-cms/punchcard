import test from 'ava';
import del from 'del';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import shared from 'punchcard-shared-tests';

import storage from '../lib/storage';
import fixtures from './fixtures/files';

test.after.always(() => {
  return del(['public']);
});

test('Storage - Default', t => {
  const input = shared.fixtures.files();

  return storage.put(input).then(files => {
    t.is(Object.keys(files).length, input.length, 'Same number of files came out as went in');

    Object.keys(files).forEach(file => {
      const result = files[file];
      const expected = input.find(inp => {
        return inp.fieldname === file;
      });

      t.true(result.hasOwnProperty('original'), 'Has original filename');
      t.true(result.hasOwnProperty('type'), 'Has a type');
      t.true(result.hasOwnProperty('relative'), 'Has a relative path');
      t.is(result.type, expected.mimetype, 'Have the same type');

      const output = fs.readFileSync(path.join(__dirname, 'public/files', result.relative));
      const original = fs.readFileSync(expected.path);

      t.is(output.toString(), original.toString(), 'Output and original are the same file');
    });
  }).catch(e => {
    console.error(e.stack); // eslint-disable-line no-console
    t.fail();
  });
});

test('Storage - Get', t => {
  const input = fixtures.saved();

  input.forEach(expected => {
    const result = storage.get(_.cloneDeep(expected));

    if (result === false) {
      t.fail('No result for input item');
    }

    t.true(result.hasOwnProperty('original'), 'Result has a name');
    t.true(result.hasOwnProperty('relative'), 'Result has a path');
    t.true(result.hasOwnProperty('type'), 'Result has a type');

    t.is(result.original, expected.original, 'Result name is same as expected name');
    t.is(result.type, expected.type, 'Result type is same as expected type');

    t.true(result.relative.indexOf(expected.relative) >= 0, 'Result path contains expected path');
  });

  t.pass();
});
