import test from 'ava';
import users from '../lib/users';
import userRoutes from '../lib/routes/users';


const model = {
  'name': 'Users',
  'description': 'Test users description',
  'id': 'users',
  'identifier': 'email',
  'attributes': [
    {
      'type': 'email',
      'id': 'email',
      'name': 'Email',
      'description': 'Your email is your username',
    },
  ],
};

test('Users functions', t => {
  t.is(typeof userRoutes, 'function', 'Submodule `routes` exists and is a function');

  t.is(typeof users, 'object', 'main Users object');
  t.is(typeof users.model, 'function', 'Submodule `model`, is the primary for `users`, and is a function');
  t.is(typeof users.model.structure, 'object', '`structure` exists and is an object');
  t.true(Array.isArray(users.model.roles), '`roles` exists and is an array');
});

//////////////////////////////
// Users object structure
//////////////////////////////
test('Users structure object', t => {
  const structure = users.model.structure;

  t.is(typeof structure, 'object', 'Structure is an object');
  t.is(structure.name, 'Users', 'Structure has name');
  t.is(structure.description, 'An individual user', 'Structure has description');
  t.is(structure.id, 'users', 'Structure has id');
  t.true(Array.isArray(structure.attributes), 'attributes is an array');
});

//////////////////////////////
// Users merged data model
//////////////////////////////
test('Users, with config, merged with correct param', t => {
  return users.model(model)
    .then(result => {
      t.is(result[0].name, 'Users', 'Get users content type name');
      t.is(result[0].description, 'Test users description', 'Get users content type desc');
      t.is(result[0].id, 'users', 'Get users content type id');
      t.is(result[0].attributes[0].name, 'Email', 'Email content type');
    });
});

test('Users merged with correct param', t => {
  return users.model()
    .then(result => {
      t.is(result[0].name, 'Users', 'Get users content type name');
      t.is(result[0].description, 'An individual user', 'Get users content type desc');
      t.is(result[0].id, 'users', 'Get users content type id');
      t.is(result[0].attributes[1].name, 'Password', 'Password attribute name');
      t.is(result[0].attributes[1].id, 'password', 'Password attribute id');
    });
});

//////////////////////////////
// Users object structure
//////////////////////////////
