/*!
 * #jsimpler v1.0.0
 * https://github.com/ostapgv/jsimpler
 */

var JSimpler = (function() {
  // window context
  var context;

  // wrapper
  var JSimpler = function(selector) {
    return new JSimpler.fn.init(selector);
  }

  // Get elements that matchs selector
  var _getMatch = function(selector) {
    var tagMatch = selector.trim().match(/^<([a-z]+)>$/);
    if(tagMatch != null) {
      var tagName = tagMatch[1];
      if(_isValidElementName(tagName)) {
        return context.document.createElement(tagName);
      }
    } else {
      return context.document.querySelectorAll(selector);
    }
  };

  var _isValidElementName = function(elementName) {
    return context.document.createElement(elementName).toString() != "[object HTMLUnknownElement]";
  }

  JSimpler.fn = JSimpler.prototype = {

    // JSimpler initialization
    init: function(selector) {
      // TODO Check if "window.document" object exist. (it doesn't work with the Jasmine)
      if (window && window.document) {
        context = window;
      } else {
        throw new Error( "JSimpler requires a window with a document" );
      }

      if (!selector) {
        return this;
      } else {
        this.match = _getMatch(selector);
      }
    },

    extend: function(a, b) {
      for(var key in b)
          if(b.hasOwnProperty(key))
              a[key] = b[key];
      return a;
    },

    setContext: function(c) {
      context = c;
      return this;
    },

    // Executes callback for each selector
    each: function(callback) {
      for(var i=0, l=this.match.length; i<l; i++) {
        callback(i, this.match[i]);
      };
      return this;
    },

    // Get elements selection array
    get: function() {
      return this.match;
    },

    size: function() {
      return this.match.length;
    },

    append: function(selector) {
      var curSelection;
      if(selector instanceof JSimpler){
        curSelection = selector;
      } else {
        curSelection = new JSimpler.fn.init(selector);
      }
      this.each(function(i, e) {
        e.innerHTML = e.innerHTML + curSelection;
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
  JSimpler.fn.init.prototype = JSimpler.fn;

  return JSimpler;

})();

//JSimpler("p").prop("style", "color: red;")