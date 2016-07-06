'use strict';

/**
 * Individual Content Type Schema
 */
const content = [
  {
    name: 'revision',
    type: 'increments',
    index: true,
  },
  {
    name: 'id',
    type: 'string',
  },
  {
    name: 'created',
    type: 'timestamp',
  },
  {
    name: 'language',
    type: 'string',
  },
  {
    name: 'sunrise',
    type: 'dateTime',
  },
  {
    name: 'sunrise-timezone',
    type: 'string',
  },
  {
    name: 'sunset',
    type: 'dateTime',
  },
  {
    name: 'sunset-timezone',
    type: 'string',
  },
  {
    name: 'approval',
    type: 'integer',
  },
  {
    name: 'publishable',
    type: 'boolean',
  },
  {
    name: 'value',
    type: 'jsonb',
  },
  {
    name: 'author',
    type: 'integer',
    foreign: {
      reference: 'users.id',
      delete: 'SET NULL',
      update: 'CASCADE',
    },
  },
];

/**
 * All Content Types Schema
 */
const allTypes = [
  {
    name: 'version',
    type: 'increments',
    index: true,
  },
  {
    name: 'created',
    type: 'timestamp',
  },
  {
    name: 'value',
    type: 'jsonb',
  },
];

/*
 * Users schema
 */
const users = [
  {
    name: 'id',
    type: 'increments',
    index: true,
  },
  {
    name: 'email',
    type: 'string',
  },
  {
    name: 'password',
    type: 'string',
  },
  {
    name: 'role',
    type: 'string',
  },
  {
    name: 'access',
    type: 'jsonb',
  },
  {
    name: 'created',
    type: 'timestamp',
  },
  {
    name: 'updated',
    type: 'timestamp',
  },
];

/*
 * Workflows schema
 */
const workflows = [
  {
    name: 'id',
    type: 'increments',
    index: true,
  },
  {
    name: 'revision',
    type: 'integer',
    foreign: {
      reference: 'content-type--services.revision',
      delete: 'SET NULL',
      update: 'CASCADE',
    },
  },
  {
    name: 'comment',
    type: 'string',
  },
  {
    name: 'step',
    type: 'string',
  },
  {
    name: 'author',
    type: 'integer',
    foreign: {
      reference: 'users.id',
      delete: 'SET NULL',
      update: 'CASCADE',
    },
  },
  {
    name: 'created',
    type: 'timestamp',
  },
  {
    name: 'updated',
    type: 'timestamp',
  },
];

module.exports = [
  {
    name: 'users',
    fields: users,
  },
  {
    name: 'workflows',
    fields: workflows,
  },
  {
    name: 'content',
    fields: content,
  },
  {
    name: 'all-types',
    fields: allTypes,
  },
];
