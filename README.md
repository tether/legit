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
