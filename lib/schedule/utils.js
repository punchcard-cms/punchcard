'use strict';

const scheduler = require('node-schedule');
const moment = require('moment-timezone');

const database = require('../database');

/*
 * Set up Revision
 *
 * @param {object} revision - A full revision of a piece of content, with all fields that are saved in the database, plus its content type's name (and slug of name) and identifier's slug
 *
 * @return Promise
 */
const setup = revision => {
  // Insert revision in to schedule table
  return database('schedule').insert({
    'id': revision.id,
    'revision': revision.revision,
    'language': revision.language,
    'sunrise': revision.sunrise,
    'sunset': revision.sunset,
    'attributes': revision.value,
    'type': revision.type,
    'key': revision.identifier,
    'type-slug': revision['type-slug'],
    'key-slug': revision.slug,
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
 *
 * @param {object} revision - A full revision of a piece of content, with all fields that are saved in the database, plus its content type's name (and slug of name) and identifier's slug
 *
 * sunset webhook here
 * @return Promise
 */
const pull = revision => {
  return database('live').select('id', 'sunset').where({
    id: revision.id,
  }).then(item => {
    const result = item[0];
    const now = moment().unix();
    const sunset = result.sunset ? moment(result.sunset).unix() : false;

    if (sunset && sunset <= now) {
      return database('live').where({
        id: result.id,
      }).del();
    }

    return false;
  });
};

/*
 * Push content live
 *
 * @param {object} revision - A full revision of a piece of content, with all fields that are saved in the database, plus its content type's name (and slug of name) and identifier's slug
 *
 * @return Promise
 */
const push = revision => {
  // Find revision in schedule table
  return database('schedule').select('*').where({
    id: revision.id,
    revision: revision.revision,
  }).then(item => {
    const result = item[0];
    const now = moment().unix();
    const sunrise = result.sunrise ? moment(result.sunrise).unix() : false;

    // If it's time to sunrise, do it
    if (sunrise <= now) {
      // See if the item is in the live DB already
      return database('live').select('id').where({
        id: result.id,
        language: result.language,
      }).then(items => {
        // If item not in live DB, insert it in full
        if (items.length === 0) {
          // live webhhook trigger
          return database('live').insert(result);
        }

        // If item in live DB, update accordingly
        return database('live').update({
          'revision': result.revision,
          'sunrise': result.sunrise,
          'attributes': result.attributes,
          'type': result.type,
          'key': result.key,
          'type-slug': result['type-slug'],
          'key-slug': result['key-slug'],
        }).where({
          id: result.id,
          language: result.language,
        });
      }).then(() => {
        // updated webhook trigger
        // Delete revision from schedule DB
        return database('schedule').where({
          id: result.id,
          revision: result.revision,
        }).del();
      });
    }

    return true;
  });
};

/*
 * Sunrise
 *
 * @param {object} revision - A full revision of a piece of content, with all fields that are saved in the database, plus its content type's name (and slug of name) and identifier's slug
 *
 * @return Promise
 */
const sunrise = revision => {
  const now = moment().unix();
  const live = moment(revision.sunrise).format();

  return new Promise(res => {
    if (moment(revision.sunrise).unix() <= now) {
      push(revision).catch(e => {
        // Need to message out here as we can't properly reject Promises
        console.error(`Sunrise failed: ${e.message}`); // eslint-disable-line no-console
      });
    }
    else {
      scheduler.scheduleJob(live, () => {
        push(revision).catch(e => {
          // Need to message out here as we can't properly reject Promises
          console.error(`Sunrise failed: ${e.message}`); // eslint-disable-line no-console
        });
      });
    }

    res(true);
  });
};

/*
 * Sunset
 *
 * @param {object} revision - A full revision of a piece of content, with all fields that are saved in the database, plus its content type's name (and slug of name) and identifier's slug
 *
 * @return Promise
 */
const sunset = revision => {
  const now = moment().unix();
  const down = revision.sunset ? moment(revision.sunset).format() : false;

  return new Promise(res => {
    if (down) {
      if (moment(revision.sunset).unix() <= now) {
        pull(revision).catch(e => {
          // Need to message out here as we can't properly reject Promises
          console.error(`Sunset failed: ${e.message}`); // eslint-disable-line no-console
        });
      }
      else {
        scheduler.scheduleJob(down, () => {
          pull(revision).catch(e => {
            // Need to message out here as we can't properly reject Promises
            console.error(`Sunset failed: ${e.message}`); // eslint-disable-line no-console
          });
        });
      }
    }

    res(true);
  });
};

module.exports = {
  setup,
  pull,
  push,
  sunrise,
  sunset,
};
