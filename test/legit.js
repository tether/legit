var Legit = require('legit');
var assert = require('assert');

var model = {
  attributes: {},

  get: function (attr) {
    return this.attributes[attr];
  },

  trigger: function () {

  },

  validation: {
    name: {
      validator: 'required',
      msg: "Your name is required."
    },
    phone: {
      validator: 'required',
      msg: "Your phone number is required."
    }
  }
};

Legit(model);

describe('model is valid', function(){
  it('should validate the model as valid', function(){
    model.attributes = {
      name: 'Eric',
      phone: '(555) 555-5555'
    };

    model.validate();

    assert(model.isLegit() === true);
  });
});

describe('model is invalid', function(){
  it('should validate the model as invalid', function(){
    model.attributes = {
      name: '',
      phone: '(555) 555-5555'
    };

    model.validate();

    assert(model.isLegit() === false);
  });
});