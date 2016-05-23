import test from 'ava';
import users from '../lib/users';


const usersContentObj = {
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
  t.is(typeof users.userRoutes, 'function', 'Submodule `userRoutes` exists and is a function');
  t.is(typeof users, 'function', 'Submodule `userModelMerged` exists and is a function');
});

test('Users, with config, merged with correct param', t => {
  return users(usersContentObj)
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
