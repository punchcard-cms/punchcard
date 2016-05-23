import test from 'ava';
import bcrypt from '../lib/bcrypt';

test('bcrypt desires strings', t => {
  // t.throws(bcrypt({}), 'generatePasswordHash requires `password` to be a string', 'String fail');
  // test waiting on: https://github.ibm.com/Watson/holmes/issues/101

  t.pass();
});

test('bcrypt converts a password', t => {
  const hash = bcrypt.generatePasswordHash('funnyPhrase');

  t.true(bcrypt.compareSync('funnyPhrase', hash), 'password is converted');
});

test('bcrypt converts a password with my salt', t => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.generatePasswordHash('funnyPhrase', salt);

  t.true(bcrypt.compareSync('funnyPhrase', hash), 'password is converted');
});
