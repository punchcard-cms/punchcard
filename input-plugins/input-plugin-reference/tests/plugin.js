import test from 'ava';
import contentTypes from 'punchcard-content-types';

import plugin from '../';

contentTypes.pluginTests(test, plugin);
