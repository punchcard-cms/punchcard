
'use strict';

/**
 * checkbox Input Plugin
 *
 *
 * An input plugin with multiple checkboxes
 */
const validation = require('./lib/validation.js');

/**
 * Single checkbox Input Plugin
 * @module checkboxInputPlugin
 */
module.exports = {
  name: 'reference',
  description: 'An input plugin with reference',
  validation: {
    referenceValidation: validation,
  },
  inputs: {
    reference: {
      validation: {
        function: 'referenceValidation',
        on: 'change',
      },
      type: 'select',
      reference: true,
      label: 'Select from the following',
      options: [],
      settings: {
        empty: false,
        view: 'select',  
        contentType: '',  
      },
    },
  },
  html: '{% if reference.settings.view == \'radio\' %}<ul>{% for option in reference.options %}<li><input type="{{reference.type}}" name="{{reference.name}}" id="{{reference.id}}--{{loop.index}}" value="{{option.value}}" {% if option.value == reference.value %}checked{% endif %}><label for="{{reference.id}}--{{loop.index}}">{{option.label}}</label></li>{% endfor %}</ul>{% endif %}{% else %}<label for="{{reference.id}}">{{reference.label}}</label><select id="{{reference.id}}" name="{{reference.name}}">{% for option in reference.options %}<option value="{{reference.value}}" {% if option.value == reference.value %}selected{% endif %}>{{option.label}}</option>{% endfor %}</select>{% endif %}',
};