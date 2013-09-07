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
    
