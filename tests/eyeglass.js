import test from 'ava';
import path from 'path';
import eyeglass from '../lib/eyeglass-exports';

test('Eyeglass Export', t => {
  const exported = eyeglass();
  const expected = {
    sassDir: path.join(__dirname, '..', 'src', 'sass'),
  };

  t.deepEqual(exported, expected, 'Contains sass directory');
});
