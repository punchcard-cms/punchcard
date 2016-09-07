import path from 'path';
import test from 'ava';
import _ from 'lodash';
import config from 'config';

import init from '../lib/init/config';

const local = path.join(__dirname, '../input-plugins');

const appcfg = _.set({}, 'content.plugins.directory', '/some/foo/directory');

test.serial('Default Configuration', t => {
  t.deepEqual(config.content.plugins.directory, [local], 'Contains only local plugins directory');
});

test.serial('Plugin dirs - string', t => {
  // convert input-plugins config to app config
  config.util.extendDeep(config, appcfg);
  t.deepEqual(config.content.plugins.directory, appcfg.content.plugins.directory, 'Converted plugins directory in config');

  return init().then(() => {
    t.true(Array.isArray(config.content.plugins.directory), 'Plugins dir is an array');
    t.is(config.content.plugins.directory[0], appcfg.content.plugins.directory, 'Contains app plugin dir');
    t.is(config.content.plugins.directory[1], local, 'Contains module plugin dir');
  });
});

test.serial('Plugin dirs with array', t => {
  const arraycfg = _.set({}, 'content.plugins.directory', ['/foo/dir/1', '/foo/dir/2']);

  // convert input-plugins config to app config
  config.util.extendDeep(config, arraycfg);

  return init().then(() => {
    t.true(Array.isArray(config.content.plugins.directory), 'Plugins dir is an array');
    t.is(config.content.plugins.directory[0], '/foo/dir/1', 'Contains 1st app plugin dir');
    t.is(config.content.plugins.directory[1], '/foo/dir/2', 'Contains 2nd app plugin dir');
    t.is(config.content.plugins.directory[2], local, 'Contains module plugin dir');
  });
});

test.serial('Bad Initialization', t => {
  const badcfg = _.set({}, 'content.plugins.directory', {});
  config.util.extendDeep(config, badcfg);

  return init().catch(err => {
    t.is(err, 'Plugin directory configuration must be string or an array', 'Contains module plugin dir');
  });
});
