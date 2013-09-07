# Legit.js

> Keeping your Javascript models legit since 2013.


Legit.js is a Javascript model validation library. It works well with frameworks such as [Backbone.js](http://backbonejs.org/).

# Getting Started

Legit's only hard dependency is [Underscore.js](http://underscorejs.org/).

To use Legit, all you need to do is mix the object into your model's prototype and then define the validations you want to use for your model. 

For example, with Backbone.js you might extend your model's prototype with Legit using `_.extend()` like so:

    // Make this model "validatable".
    _.extend(UserModel.prototype, legitValidation);

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
