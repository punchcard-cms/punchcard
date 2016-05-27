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

test('ISO Time', t => {
  const time = {
    date: '2016-05-26',
    time: '20:50',
    zone: 'EDT',
  };

  const expected = '2016-05-26T20:50:00-0400';

  const result = utils.time.iso(time.date, time.time, time.zone);

  const badResult = utils.time.iso(time.date, time.time);

  t.is(result, expected, 'Date, Time, and Zone converted to ISO Date Time');
  t.is(badResult, null, 'If an item is not included, `null` is returned');
});

test('Input Time', t => {
  const time = '2016-05-26T20:50:00-0400';

  const expected = {
    date: '2016-05-26',
    time: '20:50',
    zone: 'EDT',
  };

  const result = utils.time.input(time);
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
