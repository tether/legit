# Legit.js

> Keeping your Javascript models legit since 2013.


Legit.js is a Javascript model validation library. It works well with frameworks such as [Backbone.js](http://backbonejs.org/).

# Getting Started

Legit's only hard dependency is [Underscore.js](http://underscorejs.org/).

To use Legit, all you need to do is mix the object into your model's prototype and then define the validations you want to use for your model. 

For example, with Backbone.js you might extend your model's prototype with Legit using `_.extend()` like so:

    // Make this model "validatable".
    Legit(UserModel.prototype);

Then you could define your validations like this:

    var UserModel = Backbone.Model.extend({
      validation: {
        'first_name': {
          validator: 'required',
          msg: "Please provide your first name."
        },
        'last_name': {
          validator: 'required',
          msg: 'Please provide your last name.'
        },
        email: [
          {
            validator: 'email',
            msg: 'Please provide a valid email address.'
          },
          {
            validator: 'required',
            msg: 'Please provide a email address.'
          }
        ]
      }
    });

## Defining Validations

To define validations, you must add a `validation:` key to in model which will contain an object defining your validations. Inside this object, each key should be the name of a model attribute to validate.

The value for the key could be a single validation object, or an array containing multiple validation objects.

    // Single validation for the 'password' attribute.
    validation: {
        password: {
            validator: 'required',
            msg: "You must provide a password."
        }
    }

    // Multiple validations for the 'password' attribute.
    validation: {
        password: [
            {
                validator: 'required',
                msg: "You must provide a password."
            },
            {
                validator: 'minLength'
                vaidatorArg: 8,
                msg: "Your password must be a minimum of 8 characters long."
            }
        ]
    }

### Validations must have the following two attributes

`validator:` which can be either an anonymous Function or a String. If it's a string, it must refer to a function on the model to be called. The validator function is called with the attribute value as the argument and must return a boolean. True if the model is valid and false if it is not and should fail validation.

`msg:` which is the String error message for this validation. This error message will be passed with the 'invalid' events fired after validation. The events are explained further below.

### Optional validation keys

`onlyWhen:` can be either an anonymous Function or a String. If it is a string, it must refer to a function that exists on the model. This function is called to determine whether or not the validation should be run at all. This is particularly useful when building wizards, so you can only validate specific attributes on specific steps of the wizard. If this key is not present, the validation is run.

`validatorArg:` represents the comparison value for some default validators, such as `minLength` or `equalTo`, which are documented below.

## Available validation functions

`validate()`: loops through all your validations and runs them. This function returns an array containing objects for each invalid validation. These objects contain two keys, `attr` and `msg` (the attribute name and the validation error message). 

This function then triggers some of the following events depending on the state of the model: `validated:invalid`, `validated:valid`, `validated:validAttribute`, `validated:invalid`, `validated:invalidAttribute`. These events are documented further below.

`validateAttribute(attr)`: runs all validations for the given attribute and triggers the events `validated:validAttribute` or `validated:invalidAttribute` depending on the validity of the attribute.

`isLegit()`: Returns a `boolean`, `true` if all the model's attributes are valid and `false` otherwise.

## Events triggered on the model

`validated:invalid`: is triggered when full validation is done on the model via `validate()` and the model is invalid. This event is passed the model and the invalid attributes array as arguments.

`validated:valid`: is triggered when the full validation is done on the model via `validate()` and the model is valid. This event is passed the model.

`validated:invalidAttribute`: is triggered when a single attribute is validated and found to be invalid. It is passed the model, the attribute name and the error message.

`validated:validAttribute`: is triggered when a single attribute is validated and found to be valid. It is passed the model and the attribute name.

## Default validators

       /**
       * Check if this value exists or not.
       * 
       * @param  {?} value       The value to check.
       * 
       * @return {Boolean}       False if the value is falsy, true if it's truthy.
       */
      required: function (value) {
        return this.validateHasValue(value);
      },


      /**
       * Check if this value looks like a email.
       * 
       * @param  {?} value       The value to check.
       * 
       * @return {Boolean}       True if the value looks like a email, false if not.
       */
      email: function (value) {
        return this.validateHasValue(value) && value.toString().match(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i)
      },

      
      /**
       * Check if this value looks like a url.
       * 
       * @param  {?} value       The value to check.
       * 
       * @return {Boolean}       True if the value looks like a url, false if not.
       */
      url: function (value) {
        return this.validateHasValue(value) && value.toString().match(/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i)
      },

      
      /**
       * Check if this value looks like a url.
       * 
       * @param  {?} value      The value to check.
       * 
       * @return {Boolean}      True if the value matches any digit(s) (i.e. 0-9), false if not.
       */
      digits: function (value) {
        return this.validateHasValue(value) && value.toString().match(/^\d+$/);
      },
        
      
      /**
       * Check if this value looks like a url.
       * 
       * @param  {?} value          The value to check.
       * 
       * @return {Boolean}          True if the value matched any number (e.g. 100.000), false if not.
       */
      number: function (value) {
        return this.validateHasValue(value) && value.toString().match(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/);
      },

      /**
       * Check if this value is at least a certain length.
       * 
       * @param  {?} value                   The value to check.
       * @param  {Object} attrValidation     The validation object.
       * 
       * @return {Boolean}                   True if the value is at least as long as the
       *                                     threshhold value found in the attrValidation
       *                                     'validationArg' key.
       */
      minLength: function (value, attrValidation) {
        return value.toString().length >= attrValidation.validatorArg;
      },

      /**
       * Check if the value is equal to another model attrbute's value.
       * 
       * @param  {?} value                The value to check.
       * @param  {Object} attrValidation  The validation object.
       * 
       * @return {Boolean}                Whether or not the two attribute values are equal.      
       */
      equalTo: function (value, attrValidation) {
        return value ===  this.get(attrValidation.validatorArg);
      }
