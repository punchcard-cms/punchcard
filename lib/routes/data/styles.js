'use strict';

/*
 * Sample Data for Styles Route
 *
 * @returns {object} - Object containing sample data to use when rendering samples in the Style Guide
 */

module.exports = {
  tableData: {
    name: 'My Latest',
    data: {
      headers: [
        'content',
        'last edited',
        'actions',
        ' ',
      ],
      row: [
        {
          rows: [
            'Conversation API',
            'Tue Nov 15 2016 11:09:03 GMT+0000 (UTC)',
            'Edit Latest Revision',
            'Draft',
          ],
        },
        {
          rows: [
            'Conversation Overview',
            'Mon Nov 14 2016 03:22:12 GMT+0000 (UTC)',
            'Edit Latest Revision',
            'Draft',
          ],
        },
        {
          rows: [
            'Python SDK',
            'Fri Nov 11 2016 12:12:01 GMT+0000 (UTC)',
            'Edit Latest Revision',
            'Draft',
          ],
        },
        {
          rows: [
            'News Intelligence',
            'Wed Oct 26 2016 11:31:26 GMT+0000 (UTC)',
            'Edit Latest Revision',
            'Approved',
          ],
        },
        {
          rows: [
            'Cognitive Head Hunter',
            'Wed Oct 26 2016 18:42:40 GMT+0000 (UTC)',
            'Edit Latest Revision',
            'Needs Approval',
          ],
        },
      ],
    },
  },
};
