import test from 'ava';
import acl from '../lib/auth/acl';

const userReq = {
  user: {
    id: 1234,
  },
};

const rolesConfig = [
  {
    name: 'Foo Creator (test)',
    id: 'foo-editor',
    allows: [
      {
        resources: '/users',
        permissions: '*',
      },
      {
        resources: '/content/foo',
        permissions: '*',
      },
    ],
  },
  {
    name: 'Foo Writer (test)',
    id: 'foo-writer',
    allows: [
      {
        resources: '/content/foo',
        permissions: ['create', 'edit'],
      },
    ],
  },
];

test('Single Item - Pass', t => {
  t.true(typeof acl.getUserId(userReq) === 'string', 'getUserId must return a string');
  t.is(acl.getUserId(userReq), '1234', 'getUserId must return the user id');
});

test('Roles requires array as configuration', t => {
  t.throws(() => {
    acl.roles('error me');
  },
  'Configuration must be an array');
});

test('User roles configuration', t => {
  const roles = acl.roles(rolesConfig);
  t.true(Array.isArray(roles), 'roles must return an array');
  t.is(roles[0].roles, 'foo-editor');
  t.is(roles[1].roles, 'foo-writer');
});

test('Returns an array', t => {
  const roles = acl.roles();
  t.true(Array.isArray(roles), 'roles must return an array');
});

