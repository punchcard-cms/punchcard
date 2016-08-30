'use strict';

const Promise = require('bluebird');
const scheduler = require('node-schedule');
const moment = require('moment-timezone');
const _ = require('lodash');

const database = require('../database');

/*
 * Set up Revision
 */
const setup = revision => {
  // Insert revision in to schedule table
  return database('schedule').insert({
    'id': revision.id,
    'revision': revision.revision,
    'language': revision.language,
    'sunrise': revision.sunrise,
    'sunset': revision.sunset,
    'value': revision.value,
    'type': revision.type,
    'key': revision.identifier,
    'type-slug': _.kebabCase(revision.type),
    'key-slug': _.kebabCase(revision.identifier),
  }).then(() => {
    // If revision has a sunset, update live DB with it
    if (revision.sunset) {
      return database('live').update('sunset', revision.sunset).where({
        id: revision.id,
      });
    }

    return true;
  });
};

/*
 * Pull content from live
 */
const pull = revision => {
  return database('live').select('id', 'sunset').where({
    id: revision.id,
  }).then(item => {
    const result = item[0];
    const now = moment().unix();
    const sunset = result.sunset ? result.sunset.unix() : false;

    if (sunset && now - sunset <= 0) {
      return database('live').where({
        id: result.id,
      }).del();
    }

    return false;
  });
};

/*
 * Push content live
 */
const push = revision => {
  // Find revision in schedule table
  return databse('schedule').select(*).where({
    id: revision.id,
    revision: revision.revision,
  }).then(item => {
    const result = item[0];
    const now = moment().unix();
    const sunrise = result.sunrise ? result.sunrise.unix() : false;

    // If it's time to sunrise, do it
    if (sunrise && now - sunrise <= 0) {
      // See if the item is in the live DB already
      return database('live').select('id').where({
        id: result.id,
        language: result.language,
      }).then(items => {
        // If item not in live DB, insert it in full
        if (items.length === 0) {
          return database('live').insert(result);
        }

        // If item in live DB, update accordingly
        return database('live').update({
          'revision': revision.revision,
          'sunrise': result.sunrise,
          'value': result.value,
          'type': result.type,
          'key': result.identifier,
          'type-slug': result['type-slug'],
          'key-slug': result['key-slug'],
        }).where({
          id: result.id,
          language: result.language,
        });
      }).then(() => {
        // Delete revision from schedule DB
        return database('schedule').where({
          id: result.id,
          revision: result.revision,
        }).del();
      });
    }

    return true
  });
};

/*
 * Schedule content sunrise/sunset
 */
const schedule = (rev, ct) => {
  const revision = _.cloneDeep(rev);
  const live = moment(revision.sunrise).format();
  const down = moment(revision.sunset).format();

  revision.type = ct.name;
  revision['type-slug'] = ct.id;

  return setup(revision).then(() => {
      scheduler.scheduleJob(live, () => {
        push(revision).catch(e => {
          console.error(e);
        });
      });

      scheduler.scheduleJob(down, () => {
        pull(revision).catch(e => {
          console.error(e);
        });
      });

      return true;
  });
};

/*
 * Bootstrap content on initialization
 */
const bootstrap = () => {
  return database('schedule').select(*).orderBy('sunrise').then(items => {
    return Promise.map(items, item => {
      return push(item);
    });
  }).then(() => {
    return databse('live').select(*).then(items => {
      return Promise.map(items, item => {
        pull(item);
      });
    });
  });
};
