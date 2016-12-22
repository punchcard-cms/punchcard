'use strict';

const uuid = require('uuid');
const cloneDeep = require('lodash/cloneDeep');
const ipsum = require('lorem-ipsum');
const slugify = require('underscore.string/slugify');

const files = require('./files');

const type = name => {
  return {
    name,
    id: slugify(name),
    description: ipsum({
      count: Math.round(Math.random() * 6 + 1),
      units: 'words',
    }),
    attributes: [
      {
        name: 'Name',
        inputs: {
          text: {
            label: 'Name',
            type: 'text',
            id: uuid.v4(),
            name: 'name--text',
          },
        },
        id: `${slugify(name)}-name`,
        type: 'text',
      },
      {
        name: 'Textblock',
        inputs: {
          textblock: {
            label: 'Text',
            type: 'textarea',
            id: uuid.v4(),
            name: 'textblock--textarea',
          },
        },
        id: `${slugify(name)}-textblock`,
        type: 'textarea',
      },
      {
        name: 'Referencer',
        inputs: {
          referencer: {
            label: 'Text',
            type: 'reference',
            id: uuid.v4(),
            name: 'referencer--reference',
            settings: {
              contentType: 'will-be-changed',
            },
            reference: true,
          },
        },
        id: `${slugify(name)}-referencer`,
        type: 'reference',
      },
      {
        name: 'Referencer Dual',
        inputs: {
          referencerdual1: {
            label: 'Referencer 1',
            type: 'reference',
            id: uuid.v4(),
            name: 'referencer1--reference',
            settings: {
              contentType: 'will-be-changed',
            },
            reference: true,
          },
          referencerdual2: {
            label: 'Referencer 2',
            type: 'reference',
            id: uuid.v4(),
            name: 'referencer2--reference',
            settings: {
              contentType: 'will-be-changed',
            },
            reference: true,
          },
        },
        id: `${slugify(name)}-referencer-dual`,
        type: 'reference',
      },
      {
        name: 'Referencer Repeating',
        inputs: {
          referencerrepeat: {
            label: 'Ref Repeat',
            type: 'reference',
            id: uuid.v4(),
            name: 'referencer-repeating--reference',
            settings: {
              contentType: 'will-be-changed',
            },
            reference: true,
          },
        },
        id: `${slugify(name)}-referencer-repeating`,
        type: 'reference',
        repeatable: true,
      },
      {
        name: 'Referencer Dual Repeating',
        inputs: {
          referencerdualrepeat1: {
            label: 'Referencer 1',
            type: 'reference',
            id: uuid.v4(),
            name: 'referencer1--reference-repeating',
            settings: {
              contentType: 'will-be-changed',
            },
            reference: true,
          },
          referencerdualrepeat2: {
            label: 'Referencer 2',
            type: 'reference',
            id: uuid.v4(),
            name: 'referencer2--reference-repeating',
            settings: {
              contentType: 'will-be-changed',
            },
            reference: true,
          },
        },
        id: `${slugify(name)}-referencer-dual-repeating`,
        type: 'reference',
        repeatable: true,
      },
      {
        name: 'File Single',
        inputs: {
          filesingle: {
            label: 'File single',
            type: 'file',
            id: uuid.v4(),
            name: 'file-single--filesingle',
          },
        },
        id: `${slugify(name)}-file-single`,
        type: 'file',
      },
      {
        name: 'File Repeating',
        inputs: {
          filerepeater: {
            label: 'File repeater',
            type: 'file',
            id: uuid.v4(),
            name: 'file-repeating--filerepeater',
          },
        },
        id: `${slugify(name)}-file-repeating`,
        type: 'file',
        repeatable: true,
      },
      {
        name: 'File multiple',
        inputs: {
          filemulti1: {
            label: 'File Multi 1',
            type: 'file',
            id: uuid.v4(),
            name: 'file-multiple--filemulti1',
          },
          filemulti2: {
            label: 'File Multi 2',
            type: 'file',
            id: uuid.v4(),
            name: 'file-multiple--filemulti2',
          },
        },
        id: `${slugify(name)}-file-multiple`,
        type: 'file',
      },
    ],
  };
};

const values = ctype => {
  const results = {};
  results[`${slugify(ctype)}-name`] = {
    text: {
      value: ipsum({
        count: 1,
        units: 'words',
        format: 'plain',
      }),
    },
  };
  results[`${slugify(ctype)}-textblock`] = {
    textblock: {
      value: ipsum({
        count: 2,
        units: 'paragraphs',
        format: 'plain',
        sentenceUpperBound: 5,
        paragraphUpperBound: 3,
      }),
    },
  };
  results[`${slugify(ctype)}-referencer`] = {
    referencer: {
      value: 'make-me-an-id',
    },
  };
  results[`${slugify(ctype)}-referencer-dual`] = {
    referencerdual1: {
      value: 'make-me-an-id',
    },
    referencerdual2: {
      value: 'make-me-an-id',
    },
  };
  results[`${slugify(ctype)}-referencer-repeating`] = [
    {
      referencerrepeat: {
        value: 'make-me-an-id',
      },
    },
    {
      referencerrepeat: {
        value: 'make-me-an-id',
      },
    },
  ];
  results[`${slugify(ctype)}-referencer-dual-repeating`] = [
    {
      referencerdualrepeat1: {
        value: 'make-me-an-id',
      },
      referencerdualrepeat2: {
        value: 'make-me-an-id',
      },
    },
    {
      referencerdualrepeat1: {
        value: 'make-me-an-id',
      },
      referencerdualrepeat2: {
        value: 'make-me-an-id',
      },
    },
    {
      referencerdualrepeat1: {
        value: 'make-me-an-id',
      },
      referencerdualrepeat2: {
        value: 'make-me-an-id',
      },
    },
  ];
  results[`${slugify(ctype)}-file-single`] = {
    filesingle: {
      value: files.saved()[0],
    },
  };
  results[`${slugify(ctype)}-file-repeating`] = [
    {
      filerepeater: {
        value: files.saved()[0],
      },
    },
    {
      filerepeater: {
        value: files.saved()[0],
      },
    },
  ];
  results[`${slugify(ctype)}-file-multiple`] = {
    filemulti1: {
      value: files.saved()[0],
    },
    filemulti2: {
      value: files.saved()[0],
    },
  };

  return results;
};

/**
 * Tests a piece of content formatted for the api
 *
 * @param  {object} t - ava testing
 * @param  {object} content - the piece of content
 * @param {object} query - request query
 */
const formatted = (t, content, query) => {
  const qry = cloneDeep(query) || {};
  let typeslug;
  if (!qry.hasOwnProperty('depth')) {
    qry.depth = 0;
  }

  t.true(content.hasOwnProperty('id'), 'Contains ID');
  t.true(content.hasOwnProperty('type'), 'Contains Type');

  if (typeof content.type === 'object') {
    t.true(content.type.hasOwnProperty('name'), 'Contains Type Name');
    t.true(content.type.hasOwnProperty('slug'), 'Contains Type Slug');
    t.true(content.type.hasOwnProperty('url'), 'Contains Type url');
    typeslug = content.type.slug;
  }
  else {
    t.true(content.hasOwnProperty('type_slug'), 'Contains Type Slug');
    typeslug = content.type_slug;
  }

  t.true(content.hasOwnProperty('key'), 'Contains Key');
  t.true(content.hasOwnProperty('key_slug'), 'Contains Key Slug');

  // if follow, then should have attributes
  if (qry.follow && qry.depth >= 0) {
    t.true(content.hasOwnProperty('attributes'), 'Contains attributes');

    // if we still have depth, keep digging down
    if (qry.depth > 0) {
      // circular eslint problem
      depths(t, content.attributes, qry); // eslint-disable-line no-use-before-define
    }
  }
  else {
    t.true(content.hasOwnProperty('meta'), 'Contains Meta');
    t.false(content.hasOwnProperty('attributes'), 'Does not contain attributes');
    t.is(content.meta.url, `/api/types/${typeslug}/${content.id}`, 'URL points to full content item');
  }

  // return true;
};

/**
 * Checks attributes with references are formatted correctly depending on depth
 *
 * @param  {object} t - ava testing
 * @param  {object} attrs object containing attributes to test
 * @param {object} query - request query
 *
 */
const depths = (t, attrs, query) => {
  const qry = cloneDeep(query);

  if (qry.hasOwnProperty('depth')) {
    qry.depth--;
  }
  else {
    qry.depth = -1;
  }

  Object.keys(attrs).forEach(attr => {
    // we're only checking attributes with references
    if (attr.split('-').indexOf('referencer') > -1) {
      // array means it's a repeatable
      if (Array.isArray(attrs[attr])) {
        // gets each entry
        attrs[attr].forEach(entry => {
          // no id makes this a multi-input
          if (entry && !entry.hasOwnProperty('id')) {
            // gets the id of each input
            Object.keys(entry).forEach(id => {
              // check formatting
              formatted(t, entry[id], qry);

              return;
            });
          }
          else {
            // check formatting
            formatted(t, entry, qry);

            return;
          }
        });
      }
      else {
        // no id makes this a multi-input
        if (attrs[attr] && !attrs[attr].hasOwnProperty('id')) {
          // gets the id of each input
          Object.keys(attrs[attr]).forEach(id => {
            // check formatting
            formatted(t, attrs[attr][id], qry);

            return;
          });
        }
        else {
          // check formatting
          formatted(t, attrs[attr], qry);
        }
      }
    }

    return;
  });
};

/**
 * Randomly selects an item from source, and it's coresponding model
 *
 * @param {array} source - should contain multiple items to randomly select from
 * @param {array} models - contains the model from which the source item is derived
 *
 * @returns {object}  - selected item and its model
 */
const testables = (source, models) => {
  const random = Math.round(Math.random() * (source.length - 1));
  let expected = source[random];
  if (expected === undefined) {
    expected = cloneDeep(source[(source.length - 1)]);
  }

  const model = models.find(typ => {
    return typ.id === expected['type-slug'];
  });

  return {
    expected,
    model,
  };
};

module.exports = {
  type,
  values,
  formatted,
  depths,
  testables,
};
