import test from 'ava';
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

  const expectedUTC = {
    date: '2016-05-28',
    time: '01:56',
    zone: 'UTC',
  };

  const result = utils.time.input(time, 'America/New_York');
  const resultUTC = utils.time.input(time);
  const badResult = utils.time.input('');

  t.deepEqual(result, expected, 'ISO Date Time converted to date, time, and zone');
  t.deepEqual(resultUTC, expectedUTC, 'ISO Date Time converted to UTC date, time, and zone');
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
    'service-name--text--0': 'bar',
    'service-name--text--1': '',
    'service-email--email--0': 'foo@test.com',
    'service-email--email--1': '',
    'service-email--email--2': 'bar@test.com',
    'service-email--email--3': '',
  };

  const expected = {
    'sunset-date': { value: '' },
    'sunset-time': { value: '' },
    'sunrise-date': { value: '2016-06-23' },
    'sunrise-time': { value: '00:00' },
    'service-name': {
      text: { value: 'bar' },
    },
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
  t.is(JSON.stringify(result), JSON.stringify(expected), 'A single object is retrieved from array based on key/value');
  t.deepEqual(result, expected, 'A single object is retrieved from array based on key/value');
});

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
  const type = {
    identifier: 'service-name',
    attributes:
    [
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
  };
  const result = utils.routes.identifier(rows, type);
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
  const type = {
    identifier: 'service-name',
    attributes:
    [
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
  };
  const result = utils.routes.identifier(rows, type);
  t.is(result[0].identifier, 'Revision: 1234', 'Should have title as identifier');
});
