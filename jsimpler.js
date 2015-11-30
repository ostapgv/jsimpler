/*!
 * #jsimpler v1.0.0
 * https://github.com/ostapgv/jsimpler
 */

var JSimpler = (function() {

  var ua = window.navigator.userAgent;
  var msie = ua.indexOf("MSIE ");
  var isIE = msie > 0;
  var eventEandlersStorage = {};

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

  // Check if the element is a Node Object
  var _isNode = function(element) {
    // 1 - ELEMENT_NODE, 9 - DOCUMENT_NODE, 11 - DOCUMENT_FRAGMENT_NODE
    if (element.nodeType === 1 || element.nodeType === 9 || element.nodeType === 11) {
      return true;
    }
    return false;
  }

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
        if (typeof content === "string") {
          content = document.createTextNode(content);
        }
        // The second parameter is only for the insertBefore(). It doesn't affect to the appendChild().
        e[action](content, e.firstElementChild);
        return self;
      }
    });
  }

  // Add content near with the each mached element, using insertion rules (previousSibling/nextSibling)
  var _addSibling = function(self, content, action) {
    return self.each(self, function(that, e, i) {
      if (e && e.parentNode && e.parentNode.insertBefore) {
        e.parentNode.insertBefore(content, e[action]);
      }
    });
  }

  // Get/Set params using css() and prop() methods
  var _param = function(self, obj, value, callback) {
    // Get prop value by the name
    if (typeof obj === "string" && typeof value === "undefined"){
      if(self.length >= 1 && self[0]) {
        return callback(self[0], obj, value, "GET");
      }
    }
    // Set prop value
    return self.each(self, function(that, e, i) {
      // by name and value
      if(typeof obj === "string" && typeof value === "string") {
        callback(e, obj, value, "SET");
      // by name:value pairs object
      } else if (typeof obj === "object" && typeof value === "undefined"){
        for(var key in obj) {
          callback(e, key, obj[key], "SET");
        }
      }
    });
    return self;
  }

  // Get next/prev elements
  var _getElement = function(self, action) {
    var match = [];
    self.each(self, function(that, e, i) {
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
              this.selection = [elem];
              return this;
            }
          }

          //### Getting matched elements array ###
          // Storing array of selected DOM-elements
          // TODO Delete this.selection. Object should not stores few copies of the same data
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

    // Extending first passed object pataneter by others
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
      };
      return obj;
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
    prop: function(obj, value) {
      return _param(this, obj, value, function(e, obj, value, type) {
        if (type === "GET") {
          return e.getAttribute(obj);
        } else if (type === "SET") {
          e.setAttribute(obj, value);
        }
      });
    },

    css: function(obj, value) {
      return _param(this, obj, value, function(e, obj, value, type) {
        if (type === "GET") {
          return e.style[obj];
        } else if (type === "SET") {
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
      return _addInto(this, content, "insertBefore");
    },

    // Add the content to the END of each element in the set of matched elements
    append: function(content) {
      return _addInto(this, content, "appendChild");
    },

    // Insert content, specified by the parameter, before each element in the set of matched elements.
    before: function(content) {
      return _addSibling(this, content, "previousSibling");
    },

    // Insert content, specified by the parameter, after each element in the set of matched elements.
    after: function(content) {
      return _addSibling(this, content, "nextSibling");
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

  // Static functions (dont need to create an JSimpler object instance)
  JSimpler.makeArray = function(obj) {
    return Array.prototype.slice.call(obj);
  };


  JSimpler.hendler = function(){
    return new JSimpler.hendler
  }



  // Event Listeners
  JSimpler.fn.extend(JSimpler.fn, {

    // Original parameters (types, selector, data, handler)
    // At first it will contain only (types, handler)
    on: function(types, handler) {
      return this.each(this, function(self, e, i) {
        if(typeof types === "string" && typeof handler === "function") {
          var typesArr = types.split(" ");
          var i = 0;
          var l = typesArr.length;

          var newHandler = handler.bind({});

          // Saving original hendlers and cloned handler objects
          if(!eventEandlersStorage[e]) {
            eventEandlersStorage[e] = [typesArr[i]];
          }
          if(!eventEandlersStorage[e][typesArr[i]]) {
            eventEandlersStorage[e][typesArr[i]] = {};
          }
          var handlersObj = eventEandlersStorage[e][typesArr[i]];
          if(!handlersObj[handler]) {
            handlersObj[handler] = [];
          }
          handlersObj[handler].push(newHandler); // Example: eventEandlersStorage[divNodeObj]['click'][originalHendler] = [newHandler1, newHandler2, ...]

          for(; i < l; i++){
            if(isIE) {
              e.attachEvent( "on" + typesArr[i], newHandler);
            } else {
              e.addEventListener(typesArr[i], newHandler, false);
            }
          }
        }
      });
    },

    off: function(types, handler) {
      return this.each(this, function(self, e, i) {
        if(typeof types === "string" && typeof handler === "function") {
          var typesArr = types.split(" ");

          if(eventEandlersStorage[e]) {
            var i = 0;
            var l = typesArr.length;
            for(; i < l; i++){
              if(eventEandlersStorage[e] && eventEandlersStorage[e][typesArr[i]] && eventEandlersStorage[e][typesArr[i]][handler]) {
                //console.log(eventEandlersStorage[e][typesArr[i]]);
                var newHandlersArr = eventEandlersStorage[e][typesArr[i]][handler];
                var j = 0;
                var len = newHandlersArr.length;
                for(; j < len; j++){
                  e.removeEventListener(typesArr[i], newHandlersArr[j], false);
                }
              }
            }

          }

        }
      });
    },

    // Original parameters (type, data)
    trigger: function(type, data) {
      return this.each(this, function(self, e, i) {
        var event; // The custom event that will be created

        if (document.createEvent) {
          event = document.createEvent("HTMLEvents");
          event.initEvent(type, true, true);
        } else {
          event = document.createEventObject();
          event.eventType = type;
        }

        event.eventName = type;

        if (document.createEvent) {
          e.dispatchEvent(event);
        } else {
          e.fireEvent("on" + event.eventType, event);
        }
      });
    }


  });

  JSimpler.fn.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
    "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
    "change select submit keydown keypress keyup error contextmenu").split(" "), function(that, name, i) {
    //console.log('i='+i+' e='+e);

    // Handle event binding
    JSimpler.fn[name] = function(data, handler) {
      return arguments.length > 0 ?
        this.on(name, handler) :
        this.trigger(name);
    };

  });


  // Setting up newly created object prototype to the wrapper's protopype
  JSimpler.fn.init.prototype = JSimpler.fn;

  return JSimpler;

})();
