/*!
 * #jsimpler v1.0.0
 * https://github.com/ostapgv/jsimpler
 */

var JSimpler = (function() {

  var ua = window.navigator.userAgent;
  var msie = ua.indexOf('MSIE ');
  var isIE = msie > 0;
  var elemHandlers = {};

  // Wrapper
  var JSimpler = function(selector) {
    return new JSimpler.fn.init(selector);
  };

  // ### Common abstract methods starts with '_' ###

  // Check if the HTML element name is valid
  var _isValidElementName = function(elementName) {
    return document.createElement(elementName).toString() != '[object HTMLUnknownElement]';
  };

  // Check if the element is a Node Object
  var _isNode = function(element) {
    // 1 - ELEMENT_NODE, 9 - DOCUMENT_NODE, 11 - DOCUMENT_FRAGMENT_NODE
    if (element.nodeType === 1 || element.nodeType === 9 || element.nodeType === 11) {
      return true;
    }
    return false;
  };

  // Add content into each mached elements, using insertion rules (insertBefore/appendChild)
  var _addInto = function(self, content, action) {
    return self.each(self, function(that, e, i) {
      if (content instanceof JSimpler) {
        var l = content.length;
        while (l--) {
          e[action](content[l], e.firstElementChild);
        }
        return content;
      }else if (_isNode(e)){
        if (typeof content === 'string') {
          content = document.createTextNode(content);
        }
        // The second parameter is only for the insertBefore(). It doesn't affect to the appendChild().
        e[action](content, e.firstElementChild);
        return self;
      }
    });
  };

  // Add content near with the each mached element, using insertion rules (previousSibling/nextSibling)
  var _addSibling = function(self, content, action) {
    return self.each(self, function(that, e, i) {
      if (e && e.parentNode && e.parentNode.insertBefore) {
        e.parentNode.insertBefore(content, e[action]);
      }
    });
  };

  // Get/Set params using css() and prop() methods
  var _param = function(self, obj, value, callback) {
    // Get prop value by the name
    if (typeof obj === 'string' && typeof value === 'undefined'){
      if(self.length >= 1 && self[0]) {
        return callback(self[0], obj, value, 'GET');
      }
    }
    // Set prop value
    return self.each(self, function(that, e, i) {
      // by name and value
      if(typeof obj === 'string' && typeof value === 'string') {
        callback(e, obj, value, 'SET');
      // by name:value pairs object
      } else if (typeof obj === 'object' && typeof value === 'undefined'){
        for(var key in obj) {
          callback(e, key, obj[key], 'SET');
        }
      }
    });
  };

  // Get next/prev elements
  var _getElement = function(self, action) {
    var match = [];
    self.each(self, function(that, e, i) {
      if(e[action] !== null) {
        match = [e[action]];
        return;
      }
    });
    return match;
  };


  JSimpler.fn = JSimpler.prototype = {

    // JSimpler initialization
    init: function(selector) {
      var match, elem = [];

      // Initializing default values
      this.length = 0;
      this.selection = [];

      // Check if 'window.document' object exist
      if (!window || !window.document) {
        throw new Error( 'JSimpler requires a window with a document' );
      }

      if (!selector) {
        return this;
      }

      try {
        if (typeof selector === 'string') {

          //### New element creation ###
          if ( selector[0] === '<' && selector[ selector.length - 1 ] === '>' && selector.length >= 3 ) {
            var tagName = selector.substr(1, selector.length-2);

            if(_isValidElementName(tagName)) {
              elem = document.createElement(tagName);
              this.length = 1;
              this[0] = elem;
              this.selection = [elem];
              return this;
            }
          }

          //### Getting matched elements array ###
          // Storing array of selected DOM-elements
          this.selection = document.querySelectorAll(selector);
          // Storing selected DOM-elements to the wrapper object as the array-like object
          this.length = 0;
          Array.prototype.push.apply(this, this.selection);

        } else if (_isNode(selector)) {
          this.selection = [selector];
          Array.prototype.push.apply(this, this.selection);
        }
      } catch(err) {
        throw err;
      }

    },

    // Return an array of the passed object keys
    keys: function(o) {
      if (Object.keys) {
        return Object.keys(o);
      }
      if (o !== Object(o)) {
        throw new TypeError('Object.keys called on a non-object');
      }
      var k=[],p;
      for (p in o) {
        if (Object.prototype.hasOwnProperty.call(o, p)) {
          k.push(p);
        }
      }
      return k;
    },

    // Extending first passed object parameter by others
    extend: function() {
      for(var i=1; i<arguments.length; i++) {
        for(var key in arguments[i]) {
          if(arguments[i].hasOwnProperty(key)) {
            arguments[0][key] = arguments[i][key];
          }
        }
      }
      return arguments[0];
    },

    // Executes callback for each object
    each: function(obj, callback) {
      var i = 0;
      var l = obj.length;
      for(; i<l; i++) {
        callback(obj, obj[i], i);
      }
      return obj;
    },

    // Get elements selection array
    get: function(index) {
      if(!this.selection) {
        return [];
      }
      if(typeof index !== 'undefined') {
        return this.selection[index];
      } else {
        return this.selection;
      }
    },

    // Get the immediately previous sibling
    prev: function() {
      return _getElement(this, 'previousElementSibling');
    },

    // Get the immediately following sibling
    next: function() {
      return _getElement(this, 'nextElementSibling');
    },

    // Set property to the element
    prop: function(obj, value) {
      return _param(this, obj, value, function(e, obj, value, type) {
        if (type === 'GET') {
          return e.getAttribute(obj);
        } else if (type === 'SET') {
          e.setAttribute(obj, value);
        }
      });
    },

    // Set css styles to the element
    css: function(obj, value) {
      return _param(this, obj, value, function(e, obj, value, type) {
        if (type === 'GET') {
          return e.style[obj];
        } else if (type === 'SET') {
          e.style[obj] = value;
        }
      });
    },

    // Add class to selected elements
    addClass: function(className) {
      return this.each(this, function(self, e, i) {
        if(className.indexOf(' ') >= 0) {
          var classNameArr = className.trim().split(' ');
          var l = classNameArr.length;
          var j = 0;
          for (; j < l; j++) {
            e.classList.add(classNameArr[j]);
          }
        } else {
          e.classList.add(className);
        }
      });
    },

    // Removes the specified class by the className
    removeClass: function(className) {
      return this.each(this, function(self, e, i) {
        e.classList.remove(className);
      });
    },

    // Toggle the specified class by the className
    toggleClass: function(className) {
      return this.each(this, function(self, e, i) {
        e.classList.toggle(className);
      });
    },

    // Check if the className is presented in selected elements
    hasClass: function(className) {
      className = className.trim();
      var classArr;
      var match = false;
      this.each(this, function(self, e, i) {
        classArr = e.className.split(' ');
        if(classArr.indexOf(className) >= 0) {
          match = true;
          return;
        }
      });
      return match;
    },

    // Removes set of elements
    remove: function() {
      return this.each(this, function(self, e, i) {
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
      return _addInto(this, content, 'insertBefore');
    },

    // Add the content to the END of each element in the set of matched elements
    append: function(content) {
      return _addInto(this, content, 'appendChild');
    },

    // Insert content, specified by the parameter, before each element in the set of matched elements.
    before: function(content) {
      return _addSibling(this, content, 'previousSibling');
    },

    // Insert content, specified by the parameter, after each element in the set of matched elements.
    after: function(content) {
      return _addSibling(this, content, 'nextSibling');
    },

    // Return first matched value or set value in the set of matched elements
    val: function(value) {
      if(!value) {
        var match;
        this.each(this, function(that, e, i) {
          if(e.value) {
            match = e.value;
            return;
          }
        });
        return match;
      } else {
        return this.each(this, function(that, e, i) {
          e.value = value;
        });
      }
    }

  };


  // Event Listeners
  JSimpler.fn.extend(JSimpler.fn, {

    _getCurrentHandlers: function(handlersObj, handler) {
      if(handlersObj && handler) {
        var i = 0;
        var l = handlersObj.length;
        for(; i < l; i++) {
          if(handler === handlersObj[i].handler) {
            return handlersObj[i];
          }
        }
      }
    },

    // Attaching event listeners
    on: function(types, selector, handler) {
      if(!handler) {
        handler = selector;
        selector = undefined;
      }
      return this.each(this, function(self, e, i) {
        if(typeof types === 'string' && typeof handler === 'function') {
          var typesArr = types.split(' ');
          var handlersObj;
          var idx = 0;
          var l = typesArr.length;
          var delegated;

          // Types cycle (Example: ['click', 'hover'])
          for(; idx < l; idx++) {
            // Creating a new handler function instance
            var newHandler = handler.bind({});
            // Saving original handler and newly created handler functions
            // Example: elemHandlers = {element: {'click': {handler: handler, newHandlers: [newHandler1, newHandler2, ...], se}}}
            if(!elemHandlers[e]) {
              elemHandlers[e] = {};
            }
            if(!elemHandlers[e][typesArr[idx]]) {
              elemHandlers[e][typesArr[idx]] = [];
            }
            handlersObj = elemHandlers[e][typesArr[idx]];
            var currentHandlers = self._getCurrentHandlers(handlersObj, handler);
            if(currentHandlers) {
              finalObj = currentHandlers.newHandlers.push(newHandler);
              if(selector) currentHandlers.delegate = selector;
            } else {
              handlersObj.push({handler: handler, newHandlers: [newHandler]});
              if(selector) handlersObj.delegate = selector;
            }
            // Adding Event Listener
            if(isIE) {
              e.attachEvent( 'on' + typesArr[idx], newHandler);
            } else {
              e.addEventListener(typesArr[idx], newHandler, false);
            }
          }
        }
      });
    },

    // Removing event listeners
    off: function(types, handler) {
      return this.each(this, function(self, e, i) {
        var typesArr;
        var handlersObj;
        var currentHandlers;
        // If both arguments are passed
        if(typeof types === 'string' && typeof handler === 'function') {
          typesArr = types.split(' ');
        // If first argument is passed
        } else if(typeof types === 'string' && typeof handler === 'undefined') {
          typesArr = types.split(' ');
        // Without arguments
        } else if(typeof types === 'undefined') {
          if(elemHandlers[e]) {
            typesArr = self.keys(elemHandlers[e]);
          }
        } else return;

        if(elemHandlers[e]) {
          var idx = 0;
          var l = typesArr.length;
          // Types cycle (['click', 'hover'])
          for(; idx < l; idx++) {
            handlersObj = elemHandlers[e][typesArr[idx]];
            // If no Event Listener to remove, than finish the iteration
            if(!handlersObj) {
              continue;
            }
            currentHandlers = self._getCurrentHandlers(handlersObj, handler);

            var handlerObjLen;
            var k = 0;
            // If we don't have passed 'handler' parameter
            if (!handler) {
              handlerObjLen = handlersObj.length;
              for(; k < handlerObjLen; k++) {
                var r = 0;
                newHandlersLen = handlersObj[k].newHandlers.length;
                for(; r < newHandlersLen; r++) {
                  if(e.removeEventListener) {
                    e.removeEventListener(typesArr[idx], handlersObj[k].newHandlers[r], false);
                  } else {
                    element.detachEvent('on' + typesArr[idx], handlersObj[k].newHandlers[r]);
                  }
                }
              }
            // If we have a mached handler
            } else if(currentHandlers && currentHandlers.newHandlers) {
              newHandlersLen = currentHandlers.newHandlers.length;
              for(; k < newHandlersLen; k++) {
                if(e.removeEventListener) {
                  e.removeEventListener(typesArr[idx], currentHandlers.newHandlers[k], false);
                } else {
                  element.detachEvent('on' + typesArr[idx], currentHandlers.newHandlers[k]);
                }
              }
            }

            if(typeof types === 'string' && typeof handler === 'undefined') {
              elemHandlers[e][typesArr[idx]] = [];
            }
          }
        }
        if(typeof types === 'undefined') {
          elemHandlers[e] = {};
        }
      });
    },

    // Trigger event by it's name
    trigger: function(type) {
      return this.each(this, function(self, e, i) {
        var newEvent; // The custom event that will be created

        if (document.createEvent) {
          newEvent = document.createEvent('Event');
          newEvent.initEvent(type, true, true);
        } else {
          newEvent = document.createEventObject();
          newEvent.eventType = type;
        }

        newEvent.eventName = type;
        newEvent.preventDefault();

        if (document.createEvent) {
          e.dispatchEvent(newEvent);
        } else {
          e.fireEvent('on' + newEvent.eventType, newEvent);
        }
      });
    },

    // Event listeners delegation (not finished)
    delegate: function(selector, types, handler) {
      return this.on(types, selector, handler);
    }

  });

  // Creating shorthand functions for every event
  JSimpler.fn.each( ('blur focus focusin focusout load resize scroll unload click dblclick ' +
    'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' +
    'change select submit keydown keypress keyup error contextmenu').split(' '), function(that, name, i) {

    // Handle event binding
    JSimpler.fn[name] = function(data, handler) {
      return arguments.length > 0 ?
        this.on(name, handler) :
        this.trigger(name);
    };

  });

  JSimpler.fn.extend(JSimpler, {

    // Create bind function with the same body and this=context
    bind: function(func, context) {

      if(typeof arguments[0] !== "function") {
        throw new TypeError("There is no way to create a bind function for the not callable object");
      }
      var bindArgs = [].slice.call(arguments, 2);

      var fTmp = function() {};
      var fBound = function() {
        var args = [].slice.call(arguments);
        var concatedArgs = bindArgs.concat(args);
        return func.apply(context, concatedArgs);
      };

      fTmp.prototype = func.prototype;
      fBound.prototype = new fTmp();

      return fBound;
    },

    // Return filtered array with elements filtered by the callback function
    filter: function(arr, callback) {
      if(!arr || !arr.length || isNaN(arr.length)) {
        throw new TypeError("An array is expected as the first argument");
      }

      var len = arr.length;
      if (typeof callback !== 'function') {
        throw new TypeError("second argument should be a function");
      }

      var res = [];
      for (var i = 0; i < len; i++) {
        var val = arr[i];
        if (callback.call(null, val, i, arr)) {
          res.push(val);
        }
      }

      return res;

    },

    // Check if passed object is simple
    hasSimpleType: function(obj) {
      // Handle the 3 simple types (String, Number, Boolean), and null or undefined
      return (obj === null || obj ===undefined || typeof obj != "object") ? true : false;
    },

    // Clone object
    clone: function(obj) {
      if (JSimpler.hasSimpleType(obj)) return obj;
      var copy = obj.constructor();
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) {
          copy[attr] = obj[attr];
        }
      }
      return copy;
    },

    // Deep object cloning
    deepClone: function(obj) {
      var copy;

      // Handle the simple types, null, undefined
      if (JSimpler.hasSimpleType(obj)) return obj;

      // Handle Date
      if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
      }

      // Handle Array
      if (obj instanceof Array) {
        copy = [];
        var i = 0;
        var l = obj.length;
        for (; i < l; i++) {
          copy[i] = JSimpler.deepClone(obj[i]);
        }
        return copy;
      }

      // Handle Object
      if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
          if (obj.hasOwnProperty(attr)) {
            copy[attr] = JSimpler.deepClone(obj[attr]);
          }
        }
        return copy;
      }

      throw new Error("Unable to copy obj! Its type isn't supported.");
    },

    // Merging two elements and return first one
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

    makeArray: function(obj) {
      return Array.prototype.slice.call(obj);
    }


  });


  // Setting up newly created object prototype to the wrapper's protopype
  JSimpler.fn.init.prototype = JSimpler.fn;

  return JSimpler;

})();
