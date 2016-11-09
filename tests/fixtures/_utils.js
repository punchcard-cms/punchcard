const uuid = require('uuid');
const cloneDeep = require('lodash/cloneDeep');
const ipsum = require('lorem-ipsum');
const slugify = require('underscore.string/slugify');

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

  return results;
};

/**
 * Tests attributes with references
 * @param  {object} t - ava testing
 * @param  {object|array} attrs object containing attributes to test
 *
 * @returns {object|function|boolean} various returns
 */
const referencer = (t, attrs) => {
  if (typeof attrs !== 'object' || attrs === undefined) {
    return;
  }

  // an individual piece of content, so we need to test just the attributes
  if (attrs.hasOwnProperty('attributes')) {
    // eslint will not allow a return here
    return referencer(t, attrs.attributes); // eslint-disable-line consistent-return
  }

  // an array of attributes, this set of attributes is a repeatable
  if (Array.isArray(attrs)) {
    attrs.forEach(attr => {
      Object.keys(attr).forEach(atr => {
        // an individual piece of content, so we need to test just the attributes
        // at this point, we've found a piece of content _inside_ a piece of content's attributes
        if (attr[atr].hasOwnProperty('attributes')) {
          return referencer(t, attr[atr].attributes);
        }

        // we've reached our depth, test `meta` exists
        else if (attr[atr].hasOwnProperty('id')) {
	  t.true(attr[atr].hasOwnProperty('meta'), 'attribute in array contains meta');
	  t.true(attr[atr].meta.hasOwnProperty('url'), 'attribute in array contains meta url');

	  return true;
	}

	return true;
      });
    });
  }

  // now we go through each attribute
  Object.keys(attrs).forEach(attr => {
    // only testing referencer attributes
    if (attr.split('-').indexOf('referencer') > -1) {
      const item = attrs[attr];

      // if attributes exists, we're still digging down in our depth, recurseit!
      if (item.hasOwnProperty('attributes')) {
        return referencer(t, item.attributes);
      }

      // if it's an array, we're in a repeatable - recurseit!
      if (Array.isArray(item)) {
        return referencer(t, item);
      }

      // non-repeatable attribute with multiple inputs
      if (typeof item === 'object' && typeof item[Object.keys(item)[0]] === 'object') {
        // if it has attributes, we're not at depth so....uuuuuuhhhhhhhaaaAAAAHHHH recursit!
        if (item[Object.keys(item)[0]].hasOwnProperty('attributes')) {
          Object.keys(item).forEach(itm => {
	    return referencer(t, item[itm].attributes);
          });

	  return true;
        }

        // no attributes - it should have a meta then
        Object.keys(item).forEach(itm => {
	  t.true(item[itm].hasOwnProperty('meta'), 'attribute in array contains meta');
	  t.true(item[itm].meta.hasOwnProperty('url'), 'attribute in array contains meta url');

	  return true;
	});
      }

      // non-repeatable; single input
      else {
	t.true(item.hasOwnProperty('meta'), 'attribute in array contains meta');
	t.true(item.meta.hasOwnProperty('url'), 'attribute in array contains meta url');
      }
    }

    return true;
  });
};

/**
 * Tests for a formatted attribute
 * @param  {object} t - ava testing
 * @param  {object} attr object containing attributes to test
 *
 * @returns {boolean} returns true
 */
const formatted = (t, attr) => {
  let typeslug;

  t.true(attr.hasOwnProperty('id'), 'Contains ID');
  t.true(attr.hasOwnProperty('type'), 'Contains Type');

  if (typeof attr.type === 'object') {
    t.true(attr.type.hasOwnProperty('name'), 'Contains Type Name');
    t.true(attr.type.hasOwnProperty('slug'), 'Contains Type Slug');
    t.true(attr.type.hasOwnProperty('url'), 'Contains Type url');
    typeslug = attr.type.slug;
  }
  else {
    t.true(attr.hasOwnProperty('type_slug'), 'Contains Type Slug');
    typeslug = attr.type_slug;
  }

  t.true(attr.hasOwnProperty('key'), 'Contains Key');
  t.true(attr.hasOwnProperty('key_slug'), 'Contains Key Slug');

  if (!attr.hasOwnProperty('meta')) {
    t.true(attr.hasOwnProperty('attributes'), 'Contains attributes');

    return referencer(t, attr.attributes);
  }

  t.true(attr.hasOwnProperty('meta'), 'Contains Meta');
  t.false(attr.hasOwnProperty('attributes'), 'Does not contain attributes');
  t.is(attr.meta.url, `/api/types/${typeslug}/${attr.id}`, 'URL points to full content item');

  return true;
};

/**
 * Checks attributes are formatted depending on depth
 * @param  {object} t - ava testing
 * @param  {object} attrs object containing attributes to test
 * @param  {number} depth - depth function should recurse
 *
 */
const depths = (t, attrs, depth) => {
  let dep = depth;
  dep--;

  Object.keys(attrs).forEach(attr => {
    if (attr.split('-').indexOf('referencer') > -1) {
      if (attrs[attr].hasOwnProperty('id')) {
	formatted(t, attrs[attr]);
	if (dep > 0) {
	  depths(t, attrs[attr], dep);
	}
      }
      else if (!Array.isArray(attrs[attr])) {
	Object.keys(attrs[attr]).forEach(atr => {
	  formatted(t, attrs[attr][atr]);
	});
      }
    }
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
  referencer,
  formatted,
  depths,
  testables,
};
