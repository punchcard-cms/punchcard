import test from 'ava';
import del from 'del';
import buffertools from 'buffertools';
import fs from 'fs';
import storage from '../lib/storage';
import fixtures from './fixtures/files';

const input = fixtures();

test.after.always(() => {
  return del(['public']);
});

test('Storage - Default', t => {
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

      const output = fs.readFileSync(result.path);
      const original = fs.readFileSync(expected.path);

      t.is(buffertools.compare(output, original), 0, 'Output and original are the same file');
    });
  }).catch(e => {
    console.error(e.stack);
    t.fail();
  });
});
