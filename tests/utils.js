import test from 'ava';
import _ from 'lodash';
import uuid from 'uuid';

import types from './fixtures/content-types/objects/all-merged';
import typesRef from './fixtures/content-types/objects/types-reference';
import utils from '../lib/utils';

test('Single Item - Pass', t => {
  const input = [
    {
      id: 'foo',
      type: 'bar',
    },
    {
      id: 'bar',
      type: 'baz',
    },
  ];

  const expected = {
    id: 'bar',
    type: 'baz',
  };

  const result = utils.singleItem('id', 'bar', input);

  t.deepEqual(result, expected, 'A single object is retrieved from array based on key/value');
});

test('Single Item - Fail', t => {
  const input = [
    {
      id: 'foo',
      type: 'bar',
    },
    {
      id: 'bar',
      type: 'baz',
    },
  ];

  const result = utils.singleItem('id', 'waldo', input);

  t.false(result, '`false` is returned if no item found');
});

test('ISO UTC Time', t => {
  const time = {
    date: '2016-05-27',
    time: '21:56',
    zone: 'America/New_York',
  };

  const expected = '2016-05-28T01:56:00.000Z';

  const result = utils.time.iso(time.date, time.time, time.zone);

  const badResult = utils.time.iso(time.date, time.time);

  t.is(result, expected, 'Date, Time, and Zone converted to ISO UTC Date Time');
  t.is(badResult, null, 'If an item is not included, `null` is returned');
});

test('Input Time', t => {
  const time = '2016-05-28T01:56:00.000Z';

  const expected = {
    date: '2016-05-27',
    time: '21:56',
    zone: 'America/New_York',
  };

  const result = utils.time.input(time, 'America/New_York');
  const badResult = utils.time.input('');

  t.deepEqual(result, expected, 'ISO Date Time converted to date, time, and zone');
  t.is(badResult, null, 'Returns `null` if empty string passed in');
});

test('Config', t => {
  const input = {
    'name--text': 'Waldo',
    'email--email': 'foo@bar.baz',
    'address--street': '100 My Street',
    'address--city': 'New York',
    'address--state': 'NY',
    'address--zip': 10108,
  };

  const expected = {
    name: {
      text: {
        value: 'Waldo',
      },
    },
    email: {
      email: {
        value: 'foo@bar.baz',
      },
    },
    address: {
      street: {
        value: '100 My Street',
      },
      city: {
        value: 'New York',
      },
      state: {
        value: 'NY',
      },
      zip: {
        value: 10108,
      },
    },
  };

  const result = utils.config(input);

  t.deepEqual(result, expected, 'Transforms input name:value in to object');
});

test('Request Format', t => {
  const input = {
    'sunset-date': '',
    'sunset-time': '',
    'sunrise-date': '2016-06-23',
    'sunrise-time': '00:00',
    'service-name-one--text': 'bar',
    'service-name--text--0': 'bar',
    'service-name--text--1': '',
    'service-email--email--0': 'foo@test.com',
    'service-email--email--1': '',
    'service-email--email--2': 'bar@test.com',
    'service-email--email--3': '',
    'service-email-two--email--0': '',
  };

  const expected = {
    'sunset-date': { value: '' },
    'sunset-time': { value: '' },
    'sunrise-date': { value: '2016-06-23' },
    'sunrise-time': { value: '00:00' },
    'service-name-one': {
      text: { value: 'bar' },
    },
    'service-name': [
      {
        text: { value: 'bar' },
      },
    ],
    'service-email': [
      {
        email: { 'value': 'foo@test.com' },
      },
      {
        email: { 'value': 'bar@test.com' },
      },
    ],
  };
  const result = utils.format(input);
  t.deepEqual(result, expected, 'A single object is retrieved from array based on key/value');
});

//////////////////////////////
// Routes - Get Identifier
//////////////////////////////
test('Get identifier', t => {
  const rows = [
    {
      value: {
        'service-name': {
          text: {
            value: 'This is the test title',
          },
        },
      },
    },
  ];

  const result = utils.routes.identifier(rows, types[0]);
  t.is(result[0].identifier, 'This is the test title', 'Should have title as identifier');
});

test('Sad empty identifier value', t => {
  const rows = [
    {
      revision: 1234,
      value: {
        'service-name': {
          text: {
            value: '',
          },
        },
      },
    },
  ];

  const result = utils.routes.identifier(rows, types[0]);
  t.is(result[0].identifier, 'Revision: 1234', 'Should have title as identifier');
});

//////////////////////////////
// Routes - Action variable
//////////////////////////////
test('Action add', t => {
  return utils.routes.actions('add').then(res => {
    t.true(res, 'Should return true on add action');
  });
});

test('Check action - must be string', t => {
  return utils.routes.actions({}).catch(err => {
    t.is(typeof err, 'string', 'Non-uuid id fails');
    t.is(err, 'Content ID must be in UUID format', 'Should fail with a message');
  });
});

test('Check action - string, but not number', t => {
  return utils.routes.actions('123').catch(err => {
    t.is(typeof err, 'string', 'Non-uuid id fails');
    t.is(err, 'Content ID must be in UUID format', 'Should fail with a message');
  });
});

test('Check action - must match an action', t => {
  return utils.routes.actions('foo').catch(err => {
    t.is(typeof err, 'string', 'Non-uuid id fails');
    t.is(err, 'Content ID must be in UUID format', 'Should fail with a message');
  });
});

test('Check content id - no id param', t => {
  return utils.routes.actions().then(result => {
    t.true(result, 'No id returns true');
  });
});

test('Check content id - IS action', t => {
  return utils.routes.actions('add').then(result => {
    t.true(result, 'Action id returns true');
  });
});

test('Check content id - IS uuid', t => {
  return utils.routes.actions(uuid.v4()).then(result => {
    t.true(result, 'Good id returns true');
  });
});

//////////////////////////////
// References
//////////////////////////////
test('Reference array has values', t => {
  const expected = {
    cts: [
      {
        id: 'test-reference',
        attributes: [
          {
            name: 'Service Reference',
            description: 'Add a reference',
            inputs: {
              reference: {
                name: 'service-reference--reference',
                options: [],
                settings: {
                  contentType: 'test-service',
                  view: 'radio',
                },
                reference: true,
                type: 'radio',
              },
            },
            id: 'service-reference',
          },
          {
            name: 'Service Reference',
            description: 'Add a reference',
            inputs: [
              {
                reference: {
                  name: 'service-reference--reference--0',
                  options: [],
                  settings: {
                    contentType: 'test-service',
                    view: 'select',
                  },
                  reference: true,
                  type: 'select',
                },
                id: 'service-reference-0',
              },
            ],
          },
        ],
      },
      {
        id: 'test-service',
        identifier: 'service-name',
        attributes: [
          {
            name: 'Service Name',
            description: 'Write a really cool name please.',
            inputs: {
              text: {
                name: 'service-name--text',
              },
            },
            id: 'service-name',
            type: 'text',
          },
        ],
      },
    ],
    references: [
      {
        type: 'test-reference',
        attr: 0,
        input: 'reference',
        ct: 'test-service',
      },
      {
        type: 'test-reference',
        attr: 1,
        input: 'reference',
        length: 1,
        ct: 'test-service',
      },
    ],
  };
  const result = utils.references(typesRef);
  t.is(result.length, expected.length, 'reference equal length');
  t.is(JSON.stringify(result), JSON.stringify(expected), 'cts and reference exists');
});

test('Reference array - Invalid Content type - Fail', t => {
  const refs = _.cloneDeep(typesRef);
  refs[0].attributes[0].inputs.reference.settings.contentType = 'foo';

  try {
    utils.references(refs);
    t.fail();
  }
  catch (e) {
    t.is(e.message, 'Content Type foo is not valid');
  }
});

test('Reference array - Missing Content type - Fail', t => {
  const refs = _.cloneDeep(typesRef);
  delete refs[0].attributes[0].inputs.reference.settings.contentType;

  try {
    utils.references(refs);
    t.fail();
  }
  catch (e) {
    t.is(e.message, 'Reference must have a content type');
  }
});
