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
          url: '/edit',
          title: 'Edit Latest Revision',
        },
        'Draft',
      ],
      [
        'Conversation Overview',
        'Mon Nov 14 2016 03:22:12 GMT+0000 (UTC)',
        {
          url: '/edit',
          title: 'Edit Latest Revision',
        },
        'Draft',
      ],
      [
        'Python SDK',
        'Fri Nov 11 2016 12:12:01 GMT+0000 (UTC)',
        {
          url: '/edit',
          title: 'Edit Latest Revision',
        },
        'Draft',
      ],
      [
        'News Intelligence',
        'Wed Oct 26 2016 11:31:26 GMT+0000 (UTC)',
        {
          url: '/edit',
          title: 'Edit Latest Revision',
        },
        'Approved',
      ],
      [
        'Cognitive Head Hunter',
        'Wed Oct 26 2016 18:42:40 GMT+0000 (UTC)',
        {
          url: '/edit',
          title: 'Edit Latest Revision',
        },
        'Needs Approval',
      ],
    ],
  },
  breadcrumbData: [
    {
      title: 'Dashboard',
      url: '/',
    },
    {
      title: 'Content',
      url: '/content',
    },
    {
      title: 'Services',
      url: '/content/services',
      active: 'true',
    },
  ],
  alertData: {
    for: '00eef724-7cbd-47f5-a735-630510f39711',
    value: 'Oops! The email or password you entered is incorrect. Please try again.',
  },
};
