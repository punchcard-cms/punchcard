import test from 'ava';
import plugin from '../lib/forms';

const formResponse = {
  body: {
    'service-name': 'Foo Service One',
    'service-desciption': 'Foo service lorem ipsum description',
    'service-url': 'foo@bar.com',
    'id': '07b45c32-001d-4c46-a785-0025b04f7f37',
    'created': '2016-05-03 20:25:14',
  },
};

test('Parse data from a form', t => {
  t.pass();
});

test('Retrieve data from a form', t => {
  const data = plugin.getFormData(formResponse);

  t.is(data['service-name'], 'Foo Service One', 'should return name from response');
  t.is(data['service-desciption'], 'Foo service lorem ipsum description', 'should return desc from response');
  t.is(data['service-url'], 'foo@bar.com', 'should return url from response');
  t.is(data.id, '07b45c32-001d-4c46-a785-0025b04f7f37', 'should return id from response');
  t.ok(data.created !== formResponse.body.created, '`created` datetime should be re-created by function');
  t.ok(data.created > formResponse.body.created, 'new `created` datetime variable will be more recent');
});
