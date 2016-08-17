
'use strict';

/**
 * Reference Input Plugin
 *
 *
 * An input plugin with reference
 */
const validation = require('./lib/validation.js');

/**
 * Reference Input Plugin
 * @module referenceInputPlugin
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
      },
    },
  },
  html: `{% if reference.type == "radio" %}<ul>{% for option in reference.options %}<li><input type="{{reference.type}}" name="{{reference.name}}" id="{{reference.id}}--{{loop.index}}" value="{{option.value}}" {% if option.value == reference.value %}checked{% endif %}><label for="{{reference.id}}--{{loop.index}}">{{option.label}}</label></li>{% endfor %}</ul>{% else %}<label for="{{reference.id}}">{{reference.label}}</label><select id="{{reference.id}}" name="{{reference.name}}">{% for option in reference.options %}<option value="{{option.value}}"{% if option.value == reference.value %}selected{% endif %}>{{option.label}}</option>{% endfor %}</select>{% endif %}`,
};