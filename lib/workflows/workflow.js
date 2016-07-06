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
      required: 'save',
      description: 'Comment required to continue workflow',
    },
    {
      type: 'select',
      id: 'action',
      name: 'Action',
      required: 'save',
      description: 'Please choose to approve or reject this content.',
      inputs: {
        select: {
          options: [
            { label: 'Select Action',
              value: '',
            },
            { label: 'Approve',
              value: 'approve',
            },
            { label: 'Reject',
              value: 'reject',
            },
          ],
        },
      },
    },
  ],
};
