import test from 'ava';
import _ from 'lodash';
import slugify from 'underscore.string/slugify';
import isUUID from 'validator/lib/isUUID';

import utils from './fixtures';

const generated = 17;

const fixtures = utils.generate(generated);

test('Fixtures generated', t => {
  t.is(typeof fixtures.types, 'object', '`types` exists and is an object');
  t.is(typeof fixtures.types.each, 'object', '`types.each` exists and is an object');
  t.true(Array.isArray(fixtures.types.names), '`types.names` exists and is an array');
  t.true(Array.isArray(fixtures.types.full), '`types.full` exists and is an array');
  t.true(Array.isArray(fixtures.content), '`content` exists and is an array');
  t.true(Array.isArray(fixtures.references), '`references` exists and is an array');
});

//////////////////////////////
// Fixtures - names of content types
//////////////////////////////
test('Test Utility - fixtures - names of content types', t => {
  const names = fixtures.types.names;

  t.is(names.length, 5, 'should have five content type names');
});

//////////////////////////////
// Fixtures - full array of content types
//////////////////////////////
test('Test Utility - fixtures - array of content types', t => {
  const full = fixtures.types.full;

  t.is(full.length, 5, 'should have five content type names');

  full.forEach(item => {
    t.true(item.hasOwnProperty('name'), 'Contains name');
    t.true(item.hasOwnProperty('id'), 'Contains ID');
    t.is(slugify(item.name), item.id, 'id is a slugged name');
    t.true(item.hasOwnProperty('description'), 'Contains description');
    t.true(item.hasOwnProperty('attributes'), 'Contains attributes');
    t.true(Array.isArray(item.attributes), 'Attributes is an array');
    item.attributes.forEach(attr => {
      t.true(attr.hasOwnProperty('name'), 'Contains name');
      t.is(typeof attr.inputs, 'object', 'inputs is an object');
      t.true(attr.hasOwnProperty('id'), 'Contains id');
      t.true(attr.hasOwnProperty('type'), 'Contains type');
      Object.keys(attr.inputs).forEach(input => {
        t.true(attr.inputs[input].hasOwnProperty('label'), 'input contains label');
        t.true(attr.inputs[input].hasOwnProperty('type'), 'input contains type');
        t.true(attr.inputs[input].hasOwnProperty('id'), 'input contains id');
        t.true(isUUID(attr.inputs[input].id), 'input id is in uuid format');
        t.true(attr.inputs[input].hasOwnProperty('name'), 'input contains name');
      });
    });
  });
});

//////////////////////////////
// Fixtures - each
//////////////////////////////
test('Test Utility - fixtures - count of content types', t => {
  const each = fixtures.types.each;

  Object.keys(each).forEach(item => {
    t.true(fixtures.types.names.indexOf(item) >= 0, 'each type should match a name from names');
  });
});

//////////////////////////////
// Fixtures - content
//////////////////////////////
test('Test Utility - fixtures - content', t => {
  const content = fixtures.content;

  t.is(content.length, generated, 'should have `generated` pieces of content');

  content.forEach(item => {
    t.true(item.hasOwnProperty('id'), 'Contains ID');
    t.true(isUUID(item.id), 'id is in uuid format');
    t.true(item.hasOwnProperty('language'), 'Contains language');
    t.true(item.hasOwnProperty('revision'), 'Contains revision');
    t.true(item.hasOwnProperty('sunrise'), 'Contains sunrise');
    t.true(_.isDate(new Date(item.sunrise)), 'includes a sunrise which is a date');
    t.true(item.hasOwnProperty('sunrise-timezone'), 'Contains sunrise timezone');
    t.true(item.hasOwnProperty('sunset'), 'Contains sunset');
    t.true(_.isDate(new Date(item.sunset)), 'includes a sunrise which is a date');
    t.true(item.hasOwnProperty('sunset-timezone'), 'Contains sunset timezone');
    t.true(item.hasOwnProperty('identifier'), 'Contains identifier');
    t.true(item.hasOwnProperty('slug'), 'Contains slug');
    t.is(slugify(item.identifier), item.slug, 'slug is slugify-ed identifier');
    t.true(item.hasOwnProperty('type'), 'Contains type');
    t.true(item.hasOwnProperty('type-slug'), 'Contains type-slug');
    t.is(slugify(item.type), item['type-slug'], 'type-slug is slugify-ed type');
    t.true(item.hasOwnProperty('value'), 'Contains value');
    t.is(typeof item.value, 'object', 'Value is an object');
    Object.keys(item.value).forEach(val => {
      if (Array.isArray(item.value[val])) {
	// check repeaters
	item.value[val].forEach(rep => {
	  Object.keys(rep).forEach(input => {
	    t.true(rep[input].hasOwnProperty('value'), 'Value input contains a value');
	    t.not(rep[input].value, null, 'value is not null');
	  });
	});
      }
      else {
	Object.keys(item.value[val]).forEach(input => {
	  t.true(item.value[val][input].hasOwnProperty('value'), 'Value input contains a value');
	  t.not(item.value[val][input].value, null, 'value is not null');
	});
      }
    });
  });
});

//////////////////////////////
// Fixtures - live
//////////////////////////////
test('Test Utility - fixtures - live', t => {
  const live = fixtures.live;

  t.is(live.length, generated, 'should have `generated` pieces of content');

  live.forEach(item => {
    t.true(item.hasOwnProperty('id'), 'Contains ID');
    t.true(isUUID(item.id), 'id is in uuid format');
    t.true(item.hasOwnProperty('language'), 'Contains language');
    t.true(item.hasOwnProperty('revision'), 'Contains revision');
    t.true(item.hasOwnProperty('sunrise'), 'Contains sunrise');
    t.true(_.isDate(new Date(item.sunrise)), 'includes a sunrise which is a date');
    t.true(item.hasOwnProperty('sunset'), 'Contains sunset');
    t.true(_.isDate(new Date(item.sunset)), 'includes a sunrise which is a date');
    t.true(item.hasOwnProperty('key'), 'Contains key');
    t.true(item.hasOwnProperty('key-slug'), 'Contains key-slug');
    t.is(slugify(item.key), item['key-slug'], 'key-slug is slugify-ed key');
    t.true(item.hasOwnProperty('type'), 'Contains type');
    t.true(item.hasOwnProperty('type-slug'), 'Contains type-slug');
    t.is(slugify(item.type), item['type-slug'], 'type-slug is slugify-ed type');
    t.true(item.hasOwnProperty('attributes'), 'Contains value');
    t.is(typeof item.attributes, 'object', 'attributes is an object');
    Object.keys(item.attributes).forEach(val => {
      if (Array.isArray(item.attributes[val])) {
	// check repeaters
	item.attributes[val].forEach(rep => {
	  Object.keys(rep).forEach(input => {
	    t.true(rep[input].hasOwnProperty('value'), 'attributes input contains a value');
	    t.not(rep[input].value, null, 'value is not null');
	  });
	});
      }
      else {
	Object.keys(item.attributes[val]).forEach(input => {
	  t.true(item.attributes[val][input].hasOwnProperty('value'), 'attributes input contains a value');
	  t.not(item.attributes[val][input].value, null, 'value is not null');
	});
      }
    });
  });
});

//////////////////////////////
// Fixtures - references
//////////////////////////////
test('Test Utility - fixtures - references', t => {
  const references = fixtures.references;

  t.pass();

  t.is(references.length, 30, 'should have 30 possible references');

  references.forEach(item => {
    t.true(item.hasOwnProperty('type'), 'Contains type');
    t.true(item.hasOwnProperty('attr'), 'Contains attr');
    t.true(item.hasOwnProperty('input'), 'Contains input');
    t.true(item.hasOwnProperty('ct'), 'Contains ct');
  });
});
