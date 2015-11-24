/*!
 * #jsimpler v1.0.0
 * https://github.com/ostapgv/jsimpler
 */

var JSimpler = (function() {

  // TODO use these RE to speed up selecting
  var idSel = /^#([\w-]+)$/,
      tagSel = /^(\w+)$/,
      classSel = /^\.([\w-]+)$/;

  // Wrapper
  var JSimpler = function(selector) {
    return new JSimpler.fn.init(selector);
  }

  // Common abstract methods starts with "_". They dont use main object
  var _isValidElementName = function(elementName) {
    return document.createElement(elementName).toString() != "[object HTMLUnknownElement]";
  }

  JSimpler.fn = JSimpler.prototype = {

    // JSimpler initialization
    init: function(selector) {
      var match, elem = [];

      // Initializing default values
      this.length = 0;
      this.selection = [];

      // TODO Check if "window.document" object exist. (it doesn't work with the Jasmine)
      if (!window || !window.document) {
        throw new Error( "JSimpler requires a window with a document" );
      }

      if (!selector) {
        return this;
      }

      try {
        if (typeof selector === "string") {

          //### New element creation ###
          if ( selector[0] === "<" && selector[ selector.length - 1 ] === ">" && selector.length >= 3 ) {
            var tagName = selector.substr(1, selector.length-2);

            if(_isValidElementName(tagName)) {
              elem = document.createElement(tagName);
              this.length = 1;
              this[0] = elem;
              return this;
            }
          }

          //### Getting matched elements array ###
          // Storing array of selected DOM-elements
          this.selection = document.querySelectorAll(selector);
          // Storing selected DOM-elements to the wrapper object as the array-like object
          this.length = 0;
          Array.prototype.push.apply(this, this.selection);
        }
      } catch(err) {
        throw err;
      }

    },

    // Merging two elements and return first one
    // NOTE no usages right now (the function not uses this keyword. Probably it should be moved to common functions)
    merge: function(first, second) {
      var len = +second.length,
        i = 0,
        j = 0;

      while (i < len) {
        first[i++] = second[j++];
      }
      first.length = j;
      return first;
    },

    // Extending wrapper prototype
    extend: function(obj) {
      for(var key in obj)
        if(obj.hasOwnProperty(key))
          this[key] = obj[key];
      return this;
    },

    // Executes callback for each selector
    each: function(callback) {
      for(var i=0, l=this.selection.length; i<l; i++) {
        callback(i, this.match[i]);
      };
      return this;
    },

    // Get elements selection array
    get: function(index) {
      if(!this.selection) {
        return [];
      }
      if(typeof index !== "undefined") {
        return this.selection[index];
      } else {
        return this.selection;
      }
    },

    // Appending elements to the current object
    // TODO This funktion doesn't work correctly now. Fix it.
    append: function(selector) {
      var curSelection;
      if(selector instanceof JSimpler){
        curSelection = selector;
      } else {
        curSelection = new JSimpler.fn.init(selector);
      }
      this.each(function(i, e) {
        e.get().appendChild(curSelection.get())
      });
      return this;
    },

    // Set property to the element
    prop: function(name, value) {
      this.each(function(i, e) {
        e.setAttribute(name, value);
      });
      return this;
    }

  };
  // Setting up newly created object prototype to the wrapper's protopype
  JSimpler.fn.init.prototype = JSimpler.fn;

  return JSimpler;

})();

// Example of extending usage
JSimpler.prototype.extend({
  newMethod: function() {
    // do something
  }
});

//JSimpler("p").prop("style", "color: red;")