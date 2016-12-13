'use strict';

/*
 * Sample Data for Styles Route
 *
 * @returns {object} - Object containing sample data to use when rendering samples in the Style Guide
 */

module.exports = {
  tableData: {
    name: 'My Latest',
    headers: [
      'content',
      'last edited',
      'actions',
      ' ',
    ],
    body: [
      [
        'Conversation API',
        'Tue Nov 15 2016 11:09:03 GMT+0000 (UTC)',
        {
          actions: [
            {
              url: '/edit',
              title: 'Edit Latest Revision',
            },
          ],
        },
        'Draft',
      ],
      [
        'Conversation Overview',
        'Mon Nov 14 2016 03:22:12 GMT+0000 (UTC)',
        {
          actions: [
            {
              url: '/edit',
              title: 'Edit Latest Revision',
            },
          ],
        },
        'Draft',
      ],
      [
        'Python SDK',
        'Fri Nov 11 2016 12:12:01 GMT+0000 (UTC)',
        {
          actions: [
            {
              url: '/edit',
              title: 'Edit Latest Revision',
            },
          ],
        },
        'Draft',
      ],
      [
        'News Intelligence',
        'Wed Oct 26 2016 11:31:26 GMT+0000 (UTC)',
        {
          actions: [
            {
              url: '/edit',
              title: 'Edit Latest Revision',
            },
          ],
        },
        'Approved',
      ],
      [
        'Cognitive Head Hunter',
        'Wed Oct 26 2016 18:42:40 GMT+0000 (UTC)',
        {
          actions: [
            {
              url: '/edit',
              title: 'Edit Latest Revision',
            },
          ],
        },
        'Needs Approval',
      ],
    ],
  },
  allContent: {
    name: 'All Content',
    headers: [
      'content',
      'last edited',
      'author',
      'actions',
      ' ',
    ],
    body: [
      [
        'Conversation API',
        'Tue Nov 15 2016 11:09:03 GMT+0000 (UTC)',
        {
          actions: [
            {
              url: '/nmtilden',
              title: 'nmtilden@us.ibm.com',
            },
          ],
        },
        {
          actions: [
            {
              url: '/edit',
              title: 'Edit Latest Revision',
            },
          ],
        },
        'Approved',
      ],
      [
        'Conversation Overview',
        'Mon Nov 14 2016 03:22:12 GMT+0000 (UTC)',
        {
          actions: [
            {
              url: '/tremblay',
              title: 'tremblay@us.ibm.com',
            },
          ],
        },
        {
          actions: [
            {
              url: '/edit',
              title: 'Edit Latest Revision',
            },
          ],
        },
        'Draft',
      ],
      [
        'Python SDK',
        'Fri Nov 11 2016 12:12:01 GMT+0000 (UTC)',
        {
          actions: [
            {
              url: '/jmkimmell',
              title: 'jmkimmell@us.ibm.com',
            },
          ],
        },
        {
          actions: [
            {
              url: '/edit',
              title: 'Edit Latest Revision',
            },
          ],
        },
        'Approved',
      ],
      [
        'News Intelligence',
        'Wed Oct 26 2016 11:31:26 GMT+0000 (UTC)',
        {
          actions: [
            {
              url: '/tremblay',
              title: 'tremblay@us.ibm.com',
            },
          ],
        },
        {
          actions: [
            {
              url: '/edit',
              title: 'Edit Latest Revision',
            },
          ],
        },
        'Needs Approval',
      ],
      [
        'Cognitive Head Hunter',
        'Wed Oct 26 2016 18:42:40 GMT+0000 (UTC)',
        {
          actions: [
            {
              url: '/snugug',
              title: 'snugug@us.ibm.com',
            },
          ],
        },
        {
          actions: [
            {
              url: '/edit',
              title: 'Edit Latest Revision',
            },
          ],
        },
        'Draft',
      ],
    ],
  },
  needsApproval: {
    name: 'Needs Approval',
    headers: [
      'content',
      'time since',
      'reviewer',
      'actions',
    ],
    body: [
      [
        'Conversation API',
        '5 days',
        {
          actions: [
            {
              url: '/nmtilden',
              title: 'nmtilden@us.ibm.com',
            },
          ],
        },
        {
          actions: [
            {
              url: '/edit',
              title: 'Edit',
            },
            {
              url: '/resend',
              title: 'Resend',
            },
          ],
        },
      ],
      [
        'Conversation Overview',
        '2 days',
        {
          actions: [
            {
              url: '/tremblay',
              title: 'tremblay@us.ibm.com',
            },
          ],
        },
        {
          actions: [
            {
              url: '/edit',
              title: 'Edit',
            },
            {
              url: '/resend',
              title: 'Resend',
            },
          ],
        },
      ],
      [
        'Python SDK',
        '10 hours',
        {
          actions: [
            {
              url: '/jmkimmell',
              title: 'jmkimmell@us.ibm.com',
            },
          ],
        },
        {
          actions: [
            {
              url: '/edit',
              title: 'Edit',
            },
            {
              url: '/resend',
              title: 'Resend',
            },
          ],
        },
      ],
      [
        'News Intelligence',
        '1 hour',
        {
          actions: [
            {
              url: '/tremblay',
              title: 'tremblay@us.ibm.com',
            },
          ],
        },
        {
          actions: [
            {
              url: '/edit',
              title: 'Edit',
            },
            {
              url: '/resend',
              title: 'Resend',
            },
          ],
        },
      ],
      [
        'Cognitive Head Hunter',
        '23 mins',
        {
          actions: [
            {
              url: '/snugug',
              title: 'snugug@us.ibm.com',
            },
          ],
        },
        {
          actions: [
            {
              url: '/edit',
              title: 'Edit',
            },
            {
              url: '/resend',
              title: 'Resend',
            },
          ],
        },
      ],
    ],
  },
  alertData: {
    for: '00eef724-7cbd-47f5-a735-630510f39711',
    value: 'Oops! The email or password you entered is incorrect. Please try again.',
  },
};
