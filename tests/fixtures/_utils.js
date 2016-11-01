const uuid = require('uuid');
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

module.exports = {
  type,
  values,
};
