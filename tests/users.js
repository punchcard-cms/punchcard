import test from 'ava';
import users from '../lib/users';
import userRoutes from '../lib/routes/users';


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

test('Exports exist', t => {
  t.is(typeof userRoutes, 'function', 'Submodule `routes` exists and is a function');
  t.is(typeof users, 'function', 'Submodule `model`, is the primary for `users`, and is a function');
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
