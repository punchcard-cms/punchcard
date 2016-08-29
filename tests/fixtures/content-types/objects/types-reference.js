/**
 * Mock of content types array using reference plugin
 * @type {Array}
 */
module.exports = [
  {
    id: 'test-reference',
    attributes: [
      {
        name: 'Service Reference',
        description: 'Add a reference',
        inputs: {
          reference: {
            name: 'service-reference--reference',
            options: [],
            settings: {
              contentType: 'test-service',
              view: 'radio',
            },
            reference: true,
            type: 'radio',
          },
        },
        id: 'service-reference',
      },
      {
        name: 'Service Reference',
        description: 'Add a reference',
        inputs: [
          {
            reference: {
              name: 'service-reference--reference--0',
              options: [],
              settings: {
                contentType: 'test-service',
                view: 'select',
              },
              reference: true,
              type: 'select',
            },
            id: 'service-reference-0',
          },
        ],
      },
    ],
  },
  {
    id: 'test-service',
    identifier: 'service-name',
    attributes: [
      {
        name: 'Service Name',
        description: 'Write a really cool name please.',
        inputs: {
          text: {
            name: 'service-name--text',
          },
        },
        id: 'service-name',
        type: 'text',
      },
    ],
  },
];
