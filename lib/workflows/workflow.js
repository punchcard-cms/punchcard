'use strict';

/**
 * Workflow data entry structure
 *
 * @returns {object} - content structure to match requirements of punchcard-content-types
 */
module.exports = {
  name: 'Workflow',
  description: 'A workflow entry',
  id: 'workflow',
  attributes: [
    {
      type: 'textarea',
      id: 'comment',
      name: 'Comment',
      description: 'Comment required to continue workflow',
    },
    {
      type: 'select',
      id: 'step',
      name: 'step',
      required: 'save',
      description: 'Select one',
      inputs: {
        select: {
          options: [
            { label: 'Publish',
              value: '0',
            },
            { label: 'Publish +1',
              value: '1',
            },
            { label: 'Publish +2',
              value: '2',
            },
          ],
        },
      },
    },
  ],
};
