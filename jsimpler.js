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

  // ### Common abstract methods starts with "_" ###

  // Check if the HTML element name is valid
  var _isValidElementName = function(elementName) {
    return document.createElement(elementName).toString() != "[object HTMLUnknownElement]";
  }

  // Add content into each mached elements, using insertion rules (insertBefore/appendChild)
  var _addContent = function(self, content, action) {
    return self.each(function(that, e, i) {
      // 1 - ELEMENT_NODE, 9 - DOCUMENT_NODE, 11 - DOCUMENT_FRAGMENT_NODE
      if (e.nodeType === 1 || e.nodeType === 9 || e.nodeType === 11) {
        // The second parameter is only for the insertBefore(). It doesn't affect to the appendChild().
        e[action](content, e.firstElementChild);
      }
    });
  }

  // Get next/prev elements
  var _getElement = function(self, action) {
    var match = [];
    self.each(function(that, e, i) {
      if(e[action] != null) {
        match = [e[action]];
        return;
      }
    });
    return match;
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
        callback(this, this.selection[i], i);
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

    // Get the immediately previous sibling
    prev: function() {
      return _getElement(this, "previousElementSibling");
    },

    // Get the immediately following sibling
    next: function() {
      return _getElement(this, "nextElementSibling");
    },

    // Set property to the element
    prop: function(name, value) {
      return this.each(function(self, e, i) {
        e.setAttribute(name, value);
      });
    },

    css: function(obj, value) {
      if(typeof obj === "string" && typeof value === "string") {
        return this.each(function(self, e, i) {
          e.style[obj] = value;
        });
      // If only the first parameter passed it should be an Object
      } else if (typeof obj === "object" && typeof value === "undefined"){
        return this.each(function(self, e, i) {
          for(var key in obj) {
            e.style[key] = obj[key];
          }
        });
      } else if (typeof obj === "string" && typeof value === "undefined"){
        if(this.selection && this.selection.length >= 1) {
          return this.selection[0].style[obj];
        }
      }
      return this;
    },

    // Add class to selected elements
    addClass: function(className) {
      return this.each(function(self, e, i) {
        e.classList.add(className);
      });
    },

    // Removes the specified class by the className
    removeClass: function(className) {
      return this.each(function(self, e, i) {
        e.classList.remove(className);
      });
    },

    // Toggle the specified class by the className
    toggleClass: function(className) {
      return this.each(function(self, e, i) {
        e.classList.toggle(className);
      });
    },

    // Check if the className is presented in selected elements
    hasClass: function(className) {
      className = className.trim();
      var classArr;
      var match = false;
      this.each(function(self, e, i) {
        classArr = e.className.split(" ");
        if(classArr.indexOf(className) >= 0) {
          match = true;
          return;
        }
      });
      return match;
    },

    // Removes set of elements
    remove: function() {
      return this.each(function(self, e, i) {
        // If element has already been deleted
        if(e) {
          e.remove();
          while (self.length--) {
            delete self[self.length];
          }
          self.length = 0;
          self.selection = [];
        }
      });
    },

    // Add the content to the BEGINING of each element in the set of matched elements
    prepend: function(content) {
      return _addContent(this, content, "insertBefore");
    },

    // Add the content to the END of each element in the set of matched elements
    append: function(content) {
      return _addContent(this, content, "appendChild");
      //var curSelection;

      /*
      if(selector instanceof JSimpler){
        curSelection = selector;
      } else {
        curSelection = new JSimpler.fn.init(selector);
      }
      this.each(function(self, e, i) {
        e.appendChild(curSelection.get())
      });
      return this;
      */
    },

    // Insert content, specified by the parameter, before each element in the set of matched elements.
    before: function(content) {
      return this.each(function(that, e, i) {
        e.parentNode.insertBefore(content, e.previousSibling);
      });
    },

    // Insert content, specified by the parameter, after each element in the set of matched elements.
    after: function(content) {
      return this.each(function(that, e, i) {
        e.parentNode.insertBefore(content, e.nextSibling);
      });
    }


  };
  // Setting up newly created object prototype to the wrapper's protopype
  JSimpler.fn.init.prototype = JSimpler.fn;

  return JSimpler;

})();

// Example of extending usage
JSimpler.fn.extend({
  newMethod: function() {
    // do something
  }
});

//JSimpler("p").prop("style", "color: red;")