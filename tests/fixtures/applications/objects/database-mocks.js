'use strict';

const moment = require('moment');
const uuid = require('uuid');

const date = moment().unix();

/*
 * Mockup of  `responses` column
 */
const responses = {
  live: [
    {
      response: 200,
      timestamp: date,
    },
    {
      response: 500,
      timestamp: date,
    },
  ],
  updated: [
    {
      response: 200,
      timestamp: date,
    },
    {
      response: 500,
      timestamp: date,
    },
  ],
  sunset: [
    {
      response: 200,
      timestamp: date,
    },
    {
      response: 500,
      timestamp: date,
    },
  ],
};

/*
 * Mockup of `applications` rows
 */
const rows = [
  {
    'id': 1,
    'name': 'Foo First Application',
    'live-endpoint': 'http://foo.com/live',
    'updated-endpoint': 'http://foo.com/updated',
    'sunset-endpoint': 'http://foo.com/sunset',
    'client-id': uuid.v4(),
    'client-secret': uuid.v4(),
    responses,
  },
  {
    'id': 2,
    'name': 'Baz Second Application',
    'updated-endpoint': 'http://baz.com/updated',
    'sunset-endpoint': 'http://baz.com/sunset',
    'client-id': uuid.v4(),
    'client-secret': uuid.v4(),
    responses,
  },
  {
    'id': 3,
    'name': 'Bar Third Application',
    'live-endpoint': 'http://bar.com/live',
    'updated-endpoint': 'http://bar.com/updated',
    'sunset-endpoint': 'http://bar.com/sunset',
    'client-id': uuid.v4(),
    'client-secret': uuid.v4(),
  },
  {
    'id': 4,
    'name': 'I will be deleted',
    'live-endpoint': 'http://sad.com/live',
    'updated-endpoint': 'http://disposable.com/updated',
    'sunset-endpoint': 'http://this-is-the-end-for-ole-number-four.com/sunset',
  },
  {
    'id': 5,
    'name': 'I have no responses',
    'live-endpoint': 'http://empty.com/live',
    'updated-endpoint': 'http://empty.com/updated',
    'sunset-endpoint': 'http://empty.com/sunset',
    'client-id': uuid.v4(),
    'client-secret': uuid.v4(),
  },
];

module.exports = {
  responses,
  rows,
};
