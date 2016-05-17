import test from 'ava';
import plugin from '../lib/schema';

test('Get Common Schema', t => {
  const commonSchema = plugin.getContentTypeCommonSchema();
  t.is(commonSchema[0].name, 'id', 'Common schema should contain id');
  t.is(commonSchema[0].type, 'uuid', 'Common schema should contain id of type UUID');
  t.is(commonSchema[1].name, 'sunrise', 'Common schema should contain sunrise');
  t.is(commonSchema[1].type, 'date', 'Common schema should contain sunrise of type date');
  t.is(commonSchema[2].name, 'sunset', 'Common schema should contain sunset');
  t.is(commonSchema[2].type, 'date', 'Common schema should contain sunset of type date');
  t.is(commonSchema[3].name, 'created', 'Common schema should contain created');
  t.is(commonSchema[3].type, 'date', 'Common schema should contain created of type date');
  t.is(commonSchema[4].name, 'parent', 'Common schema should contain parent');
  t.is(commonSchema[4].type, 'uuid', 'Common schema should contain parent of type UUID');
});

test('Get content type schema', t => {
  const schema = plugin.getContentTypeSchema('services');

  return schema.then(result => {
    t.is(result[0].name, 'id', 'Content type schema should contain id');
    t.is(result[0].type, 'uuid', 'Content type schema should contain id of type UUID');
    t.is(result[1].name, 'sunrise', 'Content type schema should contain sunrise');
    t.is(result[1].type, 'date', 'Content type schema should contain sunrise of type date');
    t.is(result[2].name, 'sunset', 'Content type schema should contain sunset');
    t.is(result[2].type, 'date', 'Content type schema should contain sunset of type date');
    t.is(result[3].name, 'created', 'Content type schema should contain created');
    t.is(result[3].type, 'date', 'Content type schema should contain created of type date');
    t.is(result[4].name, 'parent', 'Content type schema should contain parent');
    t.is(result[4].type, 'uuid', 'Content type schema should contain parent of type UUID');
    t.is(result[5].name, 'title', 'Content type schema should contain title');
    t.is(result[5].type, 'string', 'Content type schema should contain title of type string');
    t.is(result[6].name, 'email', 'Content type schema should contain email');
    t.is(result[6].type, 'string', 'Content type schema should contain email of type string');
    t.is(result[7].name, 'url', 'Content type schema should contain url');
    t.is(result[7].type, 'string', 'Content type schema should contain url of type string');
  });
});
