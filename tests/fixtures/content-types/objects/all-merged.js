'use strict';

/**
 * Mock of all content types array for the CMS
 * @type {Array}
 */
module.exports = [
  {
    'name': 'Services',
    'description': 'I am services',
    'id': 'services',
    'workflow': 'editor-approve',
    'identifier': 'service-name',
    'attributes': [
      {
        'name': 'Service Name',
        'description': 'Write a really cool name please.',
        'validation': {},
        'inputs': {
          'text': {
            'validation': {
              'function': 'textValidation',
              'on': 'blur',
            },
            'label': 'Service Name',
            'placeholder': 'add svc name',
            'type': 'text',
            'settings': {
              'empty': true,
            },
            'required': 'save',
            'id': 'c6dc7ff0-adce-4ef7-96fe-e61156ac4868',
            'name': 'service-name--text',
          },
        },
        'html': '<label for="{{text.id}}">{{text.label}}</label><input type="{{text.type}}" id="{{text.id}}" name="{{text.name}}" value="{{text.value}}" placeholder="{{text.placeholder}}" />',
        'required': 'save',
        'id': 'service-name',
        'type': 'text',
      },
      {
        'name': 'Service Desc',
        'description': 'Write your brief desciption',
        'validation': {},
        'inputs': {
          'text': {
            'validation': {
              'function': 'textValidation',
              'on': 'blur',
            },
            'label': 'Service Desc',
            'placeholder': 'add svc desc',
            'type': 'text',
            'settings': {
              'empty': true,
            },
            'required': 'publish',
            'id': '1a1e3e0f-96dc-4308-8d48-41530d01a398',
            'name': 'service-desciption--text',
          },
        },
        'html': '<label for="{{text.id}}">{{text.label}}</label><input type="{{text.type}}" id="{{text.id}}" name="{{text.name}}" value="{{text.value}}" placeholder="{{text.placeholder}}" />',
        'required': 'publish',
        'id': 'service-desciption',
        'type': 'text',
      },
      {
        'name': 'Service URL',
        'description': 'An input plugin for a single text file',
        'validation': {},
        'inputs': {
          'text': {
            'validation': {
              'function': 'textValidation',
              'on': 'blur',
            },
            'label': 'Service URL',
            'placeholder': 'add svc url',
            'type': 'text',
            'settings': {
              'empty': true,
            },
            'required': 'publish',
            'id': '9ec81263-8643-4986-9a8c-6405f817aa56',
            'name': 'service-url--text',
          },
        },
        'html': '<label for="{{text.id}}">{{text.label}}</label><input type="{{text.type}}" id="{{text.id}}" name="{{text.name}}" value="{{text.value}}" placeholder="{{text.placeholder}}" />',
        'required': 'publish',
        'id': 'service-url',
        'type': 'text',
      },
      {
        'name': 'Service Email',
        'description': 'An email input with domain validation',
        'validation': {},
        'inputs': {
          'email': {
            'validation': {
              'function': 'emailValidation',
              'on': 'blur',
            },
            'type': 'email',
            'label': 'Service Email',
            'placeholder': 'add your email',
            'settings': {
              'empty': true,
            },
            'id': 'c3f1dc1d-f601-4541-87d7-249bc3783085',
            'name': 'service-email--email',
          },
        },
        'html': '<label for="{{email.id}}">{{email.label}}</label><input type="{{email.type}}" id="{{email.id}}" name="{{email.name}}" value="{{email.value}}" placeholder="{{email.placeholder}}" />',
        'id': 'service-email',
        'type': 'email',
      },
      {
        'name': 'Service Checkbox',
        'description': 'An input plugin with multiple checkboxes',
        'validation': {},
        'inputs': {
          'checkbox': {
            'validation': {
              'function': 'checkboxValidation',
              'on': 'change',
            },
            'type': 'checkbox',
            'label': 'Service Checkbox',
            'options': [
              {
                'label': 'Uno',
                'value': 'one',
              },
              {
                'label': 'Dos',
                'value': 'two',
              },
              {
                'label': 'Tres',
                'value': 'three',
              },
            ],
            'settings': {
              'empty': false,
            },
            'id': 'acd4ba97-f52d-4fce-8f43-1a4f2a39b37d',
            'name': 'service-checkbox--checkbox',
          },
        },
        'html': '<ul>{% for option in checkbox.options %}<li><input type="{{checkbox.type}}" name="{{checkbox.name}}" id="{{checkbox.id}}--{{loop.index}}" value="{{option.value}}" {% if checkbox.value %}{% if option.value in checkbox.value %}checked{% endif %}{% endif %}><label for="{{checkbox.id}}--{{loop.index}}">{{option.label}}</label></li>{% endfor %}</ul>',
        'id': 'service-checkbox',
        'type': 'checkbox',
      },
      {
        'name': 'Service Quote',
        'description': 'Simple input plugin for quote type',
        'validation': {},
        'inputs': {
          'quote': {
            'validation': {
              'function': 'quoteValidation',
              'on': 'blur',
            },
            'label': 'Quote:',
            'type': 'text',
            'placeholder': 'Quotation Text',
            'settings': {
              'empty': false,
            },
            'id': 'fe882dd4-c1f4-4b9d-bbf9-dd372c6006af',
            'name': 'service-quote--quote',
          },
          'author': {
            'validation': {
              'function': 'quoteValidation',
              'on': 'blur',
            },
            'label': 'Author:',
            'type': 'text',
            'placeholder': 'Author Name',
            'settings': {
              'empty': false,
            },
            'id': '7d45b1ae-c263-471c-a100-ff206a3e5930',
            'name': 'service-quote--author',
          },
          'source': {
            'validation': {
              'function': 'quoteValidation',
              'on': 'blur',
            },
            'label': 'Citation:',
            'type': 'text',
            'placeholder': 'Source Material',
            'settings': {
              'empty': false,
            },
            'id': 'f98eac5a-b1fb-42f4-a4fe-e539b286b5d6',
            'name': 'service-quote--source',
          },
        },
        'html': '<label for="{{quote.id}}">{{quote.label}}</label><input type="{{quote.type}}" id="{{quote.id}}" name="{{quote.name}}" value="{{quote.value}}" placeholder="{{quote.placeholder}}" /><label for="{{author.id}}">{{author.label}}</label><input type="{{author.type}}" id="{{author.id}}" name="{{author.name}}" value="{{author.value}}" placeholder="{{author.placeholder}}" /><label for="{{source.id}}">{{source.label}}</label><input type="{{source.type}}" id="{{source.id}}" name="{{source.name}}" value="{{source.value}}" placeholder="{{source.placeholder}}" />',
        'id': 'service-quote',
        'type': 'quote',
      },
    ],
  },
  {
    'name': 'Test',
    'description': 'I am test',
    'id': 'test',
    'workflow': 'editor-approve',
    'identifier': 'test-name',
    'attributes': [
      {
        'name': 'Test Name',
        'description': 'Write a really cool name please.',
        'validation': {},
        'inputs': {
          'text': {
            'validation': {
              'function': 'textValidation',
              'on': 'blur',
            },
            'label': 'Test Name',
            'placeholder': 'Text Goes Here',
            'type': 'text',
            'settings': {
              'empty': true,
            },
            'id': 'cf862556-8e91-4bbb-8929-d56118d076b3',
            'name': 'test-name--text',
          },
        },
        'html': '<label for="{{text.id}}">{{text.label}}</label><input type="{{text.type}}" id="{{text.id}}" name="{{text.name}}" value="{{text.value}}" placeholder="{{text.placeholder}}" />',
        'id': 'test-name',
        'type': 'text',
      },
      {
        'name': 'checker',
        'description': 'An input plugin with multiple checkboxes',
        'validation': {},
        'inputs': {
          'checkbox': {
            'validation': {
              'function': 'checkboxValidation',
              'on': 'change',
            },
            'type': 'checkbox',
            'label': 'checker',
            'options': [
              {
                'label': 'red',
                'value': 'red',
              },
              {
                'label': 'blue',
                'value': 'blue',
              },
              {
                'label': 'green',
                'value': 'green',
              },
              {
                'label': 'yellow',
                'value': 'yellow',
              },
            ],
            'settings': {
              'empty': false,
            },
            'id': '95551b4d-bcdd-4b83-914e-5d7ebabf9120',
            'name': 'checker--checkbox',
          },
        },
        'html': '<ul>{% for option in checkbox.options %}<li><input type="{{checkbox.type}}" name="{{checkbox.name}}" id="{{checkbox.id}}--{{loop.index}}" value="{{option.value}}" {% if checkbox.value %}{% if option.value in checkbox.value %}checked{% endif %}{% endif %}><label for="{{checkbox.id}}--{{loop.index}}">{{option.label}}</label></li>{% endfor %}</ul>',
        'required': 'save',
        'id': 'checker',
        'type': 'checkbox',
      },
    ],
  },
];
