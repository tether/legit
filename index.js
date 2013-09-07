var each = require('each');
/**
 * Expose 'legit'
 */
module.exports = Legit;


function Legit() {
  this.invalidAttributes = [];
};


/**
 * Validates the entire model. Loops through all attributes
 * in the "validation" attribute of the model and triggers the proper
 * events depending on whether it the model is valid or not. 
 *
 * @return {Array} The invalidAttributes array.
 * 
 * @api public
 */
Legit.prototype.validate = function() {
  each(this.validation, function (key, value) {
    this.validateAttribute(key);
  }, this);

  this.triggerValidationEvents();

  if (!this.isLegit()) {
    return this.invalidAttributes;
  }
};


/**
 * Validates a single attribute for this model. Triggers proper events depending on
 * whether the attribute is valid or not.
 *
 * Validating an attribute depends on there being a key in the "validation" attribute
 * in this model that has the same name as the attribute.
 * 
 * @param  {String} attr The name of the attribute to validate.
 * 
 * @api public
 */
Legit.prototype.validateAttribute = function(attr) {
  var currentAttrVal = this.get(attr);
  var attrValidation = this.validation[attr];

  // If the defined validation for this model attribute is an array, it means
  // there are multiple validations that need to be run for this attribute.
  // So loop through and run each of them.
  if (attrValidation instanceof Array) {
    each(attrValidation, function (attrValidation) {
      this.performValidation(attrValidation, currentAttrVal, attr, true);
    }, this);
  } else {
    // Otherwise, there is only a single validation for this attribute.
    this.performValidation(attrValidation, currentAttrVal, attr, true);
  }
};

/**
 * Returns whether this model is currently valid or not.
 * 
 * @return {Boolean} Whether the model is valid or not.
 * 
 * @api public
 */
Legit.prototype.isLegit = function() {
  return this.invalidAttributes.length < 1;
};


/**
   * Performs a single validation for a given attribute.
   * 
   * @param  {Object} attrValidation The validation entry which contains the validator, msg, etc.
   * @param  {?} currentAttrVal      The value for this attribute at the time of validation.
   * @param  {String} attr           The attribute name.
   * @param  {Boolean} silent        Whether or not to trigger events. True to skip 
   *                                 triggering of events.
   * @api private
   */
Legit.prototype.performValidation = function(first_argument) {
  // Only validate if there is either no "onlyWhen" attribute
  // or the "onlyWhen" function returns true.
  if (this.shouldValidate(attrValidation)) {
    var errorMsg;

    // The validator failed.
    if (!this.runValidator(attrValidation, currentAttrVal)) {
      
      this.trackInvalidAttribute(attr, attrValidation.msg);
      
      if (!silent) {
        this.trigger('validated:invalidAttribute', this, attr, attrValidation.msg);
      }

    // The validator passed.
    } else {
      
      this.trackValidAttribute(attr, attrValidation.msg);
      
      if (!silent) {
        this.trigger('validated:validAttribute', this, attr);
      }
    }
  }
};


/**
   * Track that a particular attribute failed a validation by adding it to
   * the invalidAttributes array.
   * 
   * @param  {String} attr The attribute name.
   * @param  {String} msg  The error message.
   * 
   * @api private
   */
Legit.prototype.trackInvalidAttribute = function(attr, msg) {
  var invalidAttrObject = {
    attr: attr,
    msg: msg
  };
  // If this failed validation hasn't already been added to the 
  // invalidAttributes array, then add it now.
  if (!_.findWhere(this.invalidAttributes, invalidAttrObject)) {
    this.invalidAttributes.push(invalidAttrObject);
  }
};


/**
 * Track that a particular attribute passed a validation by removing it from
 * invalidAttributes array.
 * 
 * @param  {String} attr The attribute name.
 * @param  {String} msg  The error message.
 */
Legit.prototype.trackValidAttribute = function(attr) {
  var invalidAttrObject = {
    attr: attr,
    msg: msg
  };
  // If there is an attribute with this failed message in the invalidAttributes array, remove
  // it now.
  if (_.findWhere(this.invalidAttributes, invalidAttrObject)) {
    this.invalidAttributes = _.reject(this.invalidAttributes, function(invalidAttr){
      return _.isEqual(invalidAttrObject, invalidAttr);
    });
  }
};


/**
 * Trigger validation events for this model.
 */
Legit.prototype.triggerValidationEvents = function() {
  // Loop through each validation entry for this model.
  _.each(this.validation, function (attrValidation, attr){
    // Find any invalid entries for this attribute.
    var invalidValidators = _.where(this.invalidAttributes, { attr: attr });
    
    // There are invalid entries for this attribute.
    if (invalidValidators.length > 0) {
      // Grab the last invalid entry.
      var invalidValidator = invalidValidators[invalidValidators.length-1];
      // Trigger an "invalidAttribute" event for this attribute and pass it the model,
      // attribute name and error message.
      this.trigger('validated:invalidAttribute', this, invalidValidator.attr, invalidValidator.msg);

    // There are no invalid entrues for this attribute.
    } else {
      // Trigger a "validAttribute" event for this attribute.
      this.trigger('validated:validAttribute', this, attr);
    }
  }, this);
  
  // Is this model valid right now?
  if (!this.isLegit()) {
    // Trigger 'invalid' event and pass all invalid entries.
    this.trigger('validated:invalid', this, this.invalidAttributes);
  } else {
    // Trigger 'valid' event.
    this.trigger('validated:valid', this);
  }
};


/**
 * Should we run this validation?
 * 
 * @param  {Object} attrValidation    The validation.
 *
 * @return {Boolean}                  Whether or not this validator should be run.
 */
Legit.prototype.shouldValidate = function(attrValidation) {
  // Does 'onlyWhen' the key exist in this validation?
  if ('onlyWhen' in attrValidation) {
    // Is the "onlyWhen" value a string? If so, it's a function on this model to
    // be called.
    if (typeof attrValidation.onlyWhen === 'string') {
      
      return this[attrValidation.onlyWhen]();

    // Otherwise it's a function, so run it.
    } else {

      return attrValidation.onlyWhen();

    }

  // The key doesn't exist, so just run the validation.
  } else {

    return true;

  }
};

/**
 * Run the validator function for the given validation.
 * 
 * @param  {Object} attrValidation    The validation.
 * @param  {?} value                  The value of the attribute at the time of validation.
 * 
 * @return {Boolean}                  Whether or not the validation passed.
 */
Legit.prototype.runValidator = function(attrValidation, value) {
  if (typeof attrValidation.validator === 'string') {
    return this.defaultValidators[attrValidation.validator].call(this, value, attrValidation);
  } else {
    return attrValidation.validator.call(this, value, attrValidation);
  }
};

/**
 * Check if this value is falsy or not.
 * 
 * @param  {?} value       The value to check.
 * 
 * @return {Boolean}       False if the value is falsy, true if it's truthy.
 */
Legit.prototype.validateHasValue = function(value) {
  return value ? true : false;
};

Legit.prototype.defaultValidators = {

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

};