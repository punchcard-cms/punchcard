import test from 'ava';
import bcrypt from 'bcrypt-nodejs';
import users from '../lib/users';


const model = {
  'name': 'Users',
  'description': 'Test users description',
  'id': 'users',
  'attributes': [
    {
      'type': 'email',
      'id': 'email',
      'name': 'Email',
      'description': 'Your email is your username',
    },
  ],
};

const formBodyRes = {
  'email--email': 'user@example.com',
  'password--password': 'fooBarBaz',
  'role--select': 'superadmin',
};

test('Exports exist', t => {
  t.is(typeof users, 'function', 'Submodule `model` exists, is the primary for `users`, and is a function');
  t.is(typeof users.routes, 'function', 'Submodule `routes` exists and is a function');
  t.is(typeof users.cleanFormData, 'function', 'Submodule `cleanFormData` exists and is a function');
});

test('Gather form data', t => {
  const cleanFormData = users.cleanFormData(formBodyRes);
  const hash = bcrypt.hashSync('fooBarBaz');

  t.true(bcrypt.compareSync('fooBarBaz', hash), 'Should have `password` and it should be converted by bcrypt');
  t.is(cleanFormData.email, 'user@example.com', 'Should have `email` key');
  t.is(cleanFormData.role, 'superadmin', 'Should have `role` key');
});

test('Users, with config, merged with correct param', t => {
  return users(model)
    .then(result => {
      t.is(result[0].name, 'Users', 'Get users content type name');
      t.is(result[0].description, 'Test users description', 'Get users content type desc');
      t.is(result[0].id, 'users', 'Get users content type id');
      t.is(result[0].attributes[0].name, 'Email', 'Email content type');
    });
});

test('Users merged with correct param', t => {
  return users()
    .then(result => {
      t.is(result[0].name, 'Users', 'Get users content type name');
      t.is(result[0].description, 'A users content model.', 'Get users content type desc');
      t.is(result[0].id, 'users', 'Get users content type id');
      t.is(result[0].attributes[1].name, 'Password', 'Password attribute name');
      t.is(result[0].attributes[1].id, 'password', 'Password attribute id');
    });
});
