import test from 'ava';
import login from '../lib/auth/login';

test('Exports exist', t => {
  t.is(typeof login, 'function', 'Submodule `ensureLoggedIn` exists, is the primary for `login`, and is a function');
});
