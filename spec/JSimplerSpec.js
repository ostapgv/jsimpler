describe('JSimpler', function() {
  'use strict';

  var f;
  beforeEach(function() {
    f = jasmine.getFixtures();
    f.fixturesPath = 'base/fixtures';
    f.load('jsimpler.html');
  });

  afterEach(function() {
    f.cleanUp();
    f.clearCache();
  });

  var j = JSimpler;
  var $selectedElement;
  var selectedElement;

  it('should be defined', function() {
    expect(j).toBeDefined();
  });

  describe('Selector', function() {

    it('should select an empty array if the element does not exist in DOM', function() {
      var selector = '.some-element-not-in-the-dom';

      // We're calling $.makeArray because we need to transform jQuery result set into real array object
      var expectedSelectedElement = j.makeArray(document.querySelectorAll(selector));
      var selectedElements = j.makeArray(j(selector));

      expect(selectedElements).toEqual(expectedSelectedElement);
      expect(selectedElements.length).toBe(0);
    });

    it('should select a DOM element with given ID', function() {
      var id = 'div-id';
      var expectedSelectedElement = document.getElementById(id);
      var selectedElement = j('#' + id);
      expect(selectedElement.length).toBe(1);
      expect(selectedElement[0] instanceof HTMLElement).toBe(true);
      expect(selectedElement[0]).toBe(expectedSelectedElement);
      expect(selectedElement[0].id).toBe(id);
    });

    it('should select DOM elements with a given class name', function() {
      var className = '.infinum';
      var expectedHTMLElementsArray = j.makeArray(document.querySelectorAll(className));
      var selectedElementsArray = j.makeArray(j(className));

      expect(selectedElementsArray.length).toBe(expectedHTMLElementsArray.length);

      // We need to check for each element if it's in the expected result set because element order is not guaranteed
      selectedElementsArray.forEach(function(element) {
        expect(expectedHTMLElementsArray.indexOf(element)).not.toBe(-1);
      });
    });

    it('should select DOM elements with a given tag name', function() {
      var tagName = 'p';
      var expectedHTMLElementsArray = j.makeArray(document.querySelectorAll(tagName));
      var selectedElementsArray = j.makeArray(j(tagName));

      expect(selectedElementsArray.length).toBe(expectedHTMLElementsArray.length);

      selectedElementsArray.forEach(function(element) {
        expect(expectedHTMLElementsArray.indexOf(element)).not.toBe(-1);
      });
    });

    it('should throw an expection for invalid selector', function() {
      expect(function() {
        j(')(?/');
      }).toThrow();
    });

    it('should allow a creation elements by the tag name', function() {
      var $element = j('<div>');

      expect($element.length).toBe(1);
      expect($element[0] instanceof HTMLDivElement).toBe(true);
    });

  });


  describe('.css()', function() {

    beforeEach(function() {
      $selectedElement = j('#main-part');
      selectedElement = $selectedElement[0];
    });

    it('should set a CSS attribute of an HTML element', function() {
      $selectedElement.css('color', 'blue');
      expect($selectedElement.css('color')).toBe('blue');

      $selectedElement.css({'color': 'black', 'background-color': 'white'});
      expect($selectedElement.css('color')).toBe('black');
      expect($selectedElement.css('background-color')).toBe('white');

    });

    it('should return an existing CSS property value of an HTML element', function() {
      $selectedElement.css('display', 'block');
      expect($selectedElement.css('display')).toBe('block');
    });

    it('should set multiple CSS properties of an HTML element', function() {
      $selectedElement.css({
        'width': '800px',
        'display': 'block'
      });

      expect($selectedElement.css('display')).toBe('block');
      expect($selectedElement.css('width')).toBe('800px');
    });

    it('should properly set CSS properties if called multiple times on different HTML elements', function() {
      var $anotherEl = j('.right-menu');

      $selectedElement.css('width', '800px');
      $anotherEl.css('color', 'grey');

      expect($selectedElement.css('width')).toBe('800px');
      expect($selectedElement.css('color')).not.toBe('grey');
      expect($anotherEl.css('color')).toBe('grey');
    });

    it('should return first CSS property if multiple elements selector applied', function() {
      var $li = j('.right-menu li');
      var $firstLi = j('.right-menu li:first-child');

      $li.css('color', 'yellow');
      $firstLi.css('color', 'black');

      expect($firstLi.css('color')).toBe('black');
      expect($li.css('color')).toBe('black');
    });

  });


  describe('Class Manipulations (addClass, removeClass, toggleClass, hasClass)', function() {

    beforeEach(function() {
      $selectedElement = j('#main-part');
      selectedElement = $selectedElement[0];
    });

    it('can add a class to the element', function() {
      $selectedElement.addClass('building');
      expect($selectedElement.hasClass('building')).toBe(true);
    });

    it('should not overwrite existing css classes', function() {
      $selectedElement.addClass('spooky');
      $selectedElement.addClass('building');

      expect($selectedElement.hasClass('building')).toBe(true);
      expect($selectedElement.hasClass('spooky')).toBe(true);
      expect($selectedElement.hasClass('no-such-class-here')).toBe(false);
    });

    it('should remove a specific css class of the element', function() {
      $selectedElement.addClass('very-important-class');
      $selectedElement.addClass('super-cool-class');

      $selectedElement.removeClass('super-cool-class');

      expect($selectedElement.hasClass('super-cool-class')).toBe(false);
      expect($selectedElement.hasClass('very-important-class')).toBe(true);
    });

    it('should toggle a css class of the element', function() {
      $selectedElement.addClass('hidden-tower');

      $selectedElement.toggleClass('hidden-tower');
      expect($selectedElement.hasClass('hidden-tower')).toBe(false);

      $selectedElement.toggleClass('hidden-tower');
      expect($selectedElement.hasClass('hidden-tower')).toBe(true);
    });

    it('should return true if a HTML element has a given css class', function() {
      $selectedElement.addClass('hidden-tower');
      expect($selectedElement.hasClass('hidden-tower')).toBe(true);
    });

    it('should return false if a HTML element doesn\'t have a given css class', function() {
      $selectedElement.removeClass('hidden-tower');
      expect($selectedElement.hasClass('hidden-tower')).toBe(false);
    });

    it('should allow add few classes separated by whitespaces', function() {
      expect(function(){
        $selectedElement.addClass('first second ');
      }).not.toThrow();
      expect($selectedElement.hasClass('first')).toBe(true);
      expect($selectedElement.hasClass('second')).toBe(true);
    });

  });


  describe('Dom Manipulation', function() {
    var $selectedElement, selectedElement;

    beforeEach(function() {
      $selectedElement = j('#dom-manipulations');
      selectedElement = $selectedElement[0];
    });

    it('should be able to remove a HTML element', function() {
      var $toRemoveElement = j('#to-remove');
      var toRemoveElement = $toRemoveElement[0];

      expect(document.contains(toRemoveElement)).toBe(true);
      $toRemoveElement.remove();
      expect(document.contains(toRemoveElement)).toBe(false);
    });

    it('should correctly remove nested elements', function() {
      var parentElement = document.createElement('div');
      var childElement = document.createElement('div');

      parentElement.appendChild(childElement);
      selectedElement.appendChild(parentElement);

      var bothElements = j('#dom-manipulations div');
      bothElements.remove();

      expect(bothElements.length).toBe(0);
    });

    it('should append a HTML element to the given element', function() {
      var newElement = document.createElement('h4');
      var initialChildrenCount = selectedElement.children.length;

      expect(initialChildrenCount).toBeGreaterThan(0);

      $selectedElement.append(newElement);

      expect(selectedElement.children.length).toBe(initialChildrenCount + 1);
      expect(selectedElement.children[initialChildrenCount]).toBe(newElement);
    });

    it('should prepend a HTML element to the given element', function() {
      var newElement = document.createElement('h4');
      var initialChildrenCount = selectedElement.children.length;

      expect(initialChildrenCount).toBeGreaterThan(0);

      $selectedElement.prepend(newElement);

      expect(selectedElement.children.length).toBe(initialChildrenCount + 1);
      expect(selectedElement.children[0]).toBe(newElement);
    });

    it('should be able to add a new HTML element after a given HTML element', function() {
      var newElement = document.createElement('div');

      expect($selectedElement.next()[0]).not.toBe(newElement);
      $selectedElement.after(newElement);
      expect($selectedElement.next()[0]).toBe(newElement);
    });

    it('should be able to add a new HTML element before a given HTML element', function() {
      var newElement = document.createElement('p');

      expect($selectedElement.prev()[0]).not.toBe(newElement);
      $selectedElement.before(newElement);
      expect($selectedElement.prev()[0]).toBe(newElement);
    });

    it('should return a value of a given HTML element', function() {
      var $element = j('.input-class');
      var element = $element[0];
      var elementValue = $element.val();

      expect(elementValue).toBe('unicorn');

      element.value = 'pikachu';

      elementValue = $element.val();
      expect(elementValue).toBe('pikachu');
    });

    it('should set a value of a given HTML elements', function() {
      var $element = j('.input-class');
      var element = $element[0];
      $element.val('grecki');
      var elementValue = $element.val();

      expect(elementValue).toBe(element.value);
      expect(elementValue).toBe('grecki');
    });

    it('should not throw the exception if the target element is not in the DOM when calling remove()', function() {
      var elementNotInTheDom = document.createElement('div');
      expect(function() {
        j(elementNotInTheDom).remove();
      }).not.toThrow();
    });

    it('should not throw exception if the target element is not in the DOM when calling before() or after()', function() {
      var elementNotInTheDom = document.createElement('div');
      var newElement = document.createElement('h4');

      expect(function() {
        j(elementNotInTheDom).before(newElement);
        j(elementNotInTheDom).after(newElement);
      }).not.toThrow();
    });

    it('should add property/propierties to the set of matched elements through the prop() method', function() {
      $selectedElement.prop('alt', 'alt');
      expect(selectedElement.getAttribute('alt')).toBe('alt');

      $selectedElement.prop({'alt': 'nextAlt', 'display': 'block'});
      expect(selectedElement.getAttribute('alt')).toBe('nextAlt');
      expect(selectedElement.getAttribute('display')).toBe('block');
    });

    it('should get property of matched element through the prop() method', function() {
      $selectedElement.prop('alt', 'alter');
      expect($selectedElement.prop('alt')).toBe('alter');

      $selectedElement.prop({'alt': 'alterEgo', 'visibility': 'visible'});
      expect($selectedElement.prop('alt')).toBe('alterEgo');
      expect($selectedElement.prop('visibility')).toBe('visible');
    });

    it('should allow to insert jSimpler objects into each others', function() {
      var $element = j('#dom-manipulations');
      var element = $element[0];
      var $elementNotInTheDom = j('<p>').prop('id', 'added');

      expect(document.querySelectorAll('#dom-manipulations #added').length).toBe(0);

      $element.append($elementNotInTheDom);

      expect(document.querySelectorAll('#dom-manipulations #added')[0]).toEqual($elementNotInTheDom[0]);
    });

  });


  describe('Chaining', function() {
    var $selectedElement, selectedElement;

    beforeEach(function() {
      $selectedElement = j('#chaining');
      selectedElement = $selectedElement[0];
    });

    it('should allow to append JSimpler objects into each others few times', function() {
      var $newFirstElement = j('<p>').prop('class', 'p-element');
      var $newSecondElement = j('<a>').prop({'class': 'a-element', 'href': '#qwe'});
      expect(function(){
        $selectedElement.append($newFirstElement.append($newSecondElement));
      }).not.toThrow();

      expect(document.querySelector('#chaining p.p-element')).toBe($newFirstElement[0]);
      expect(document.querySelector('#chaining a.a-element').getAttribute('href')).toBe($newSecondElement.prop('href'));
    });

    it('should allow to combine methods applied to JSimpler objects', function() {
      expect(function(){
        $selectedElement.prepend(j('<p>')
          .append('Lorem Ipsum is simply dummy text of the printing and typesetting industry.')
          .addClass('p-class')
          .css({
            'color': 'red',
            'background-color': 'green',
          })
          .prop('display', 'block')
          .append(j('<a>')
            .append('LINK TEXT')
            .css('color', 'grey')
            .prop({
              'href': '#',
              'title': 'some title'
            })
          )
        );
      }).not.toThrow();

      expect(document.querySelector('#chaining p.p-class').getAttribute('display')).toBe('block');
      expect(document.querySelector('#chaining p.p-class').style.color).toBe('red');
      expect(document.querySelector('#chaining p.p-class').style['background-color']).toBe('green');

      expect(document.querySelector('#chaining p.p-class a').style.color).toBe('grey');
      expect(document.querySelector('#chaining p.p-class a').getAttribute('href')).toBe('#');
      expect(document.querySelector('#chaining p.p-class a').getAttribute('title')).toBe('some title');
    });

  });


  describe('Event Listeners', function() {
    var $selectedElement, selectedElement, methods;

    beforeEach(function() {
      methods = {
        showLove: function() {
          console.log('<3 JavaScript <3');
        },
        giveLove: function() {
          logSmth.log('==> JavaScript ==>');
          return '==> JavaScript ==>';
        }
      };

      spyOn(methods, 'showLove');
      spyOn(methods, 'giveLove');

      $selectedElement = j('#event');
      selectedElement = $selectedElement[0];
    });

    it('should be able to add a click event to an HTML element', function() {
      $selectedElement.on('click', methods.showLove);

      $selectedElement.click();

      expect(methods.showLove).toHaveBeenCalled();
    });

    it('should be able to add the same event+callback two times to an HTML element', function() {
      $selectedElement.on('click', methods.showLove);
      $selectedElement.on('click', methods.showLove);

      $selectedElement.click();

      expect(methods.showLove.calls.count()).toEqual(2);
    });

    it('should be able to add the same callback for two different events to an HTML element', function() {
      $selectedElement.on('click', methods.showLove);
      $selectedElement.on('hover', methods.showLove);

      $selectedElement.trigger('click');
      $selectedElement.trigger('hover');

      expect(methods.showLove.calls.count()).toEqual(2);
    });

    it('should be able to add two different callbacks for same event to an HTML element', function() {
      $selectedElement.on('click', methods.showLove);
      $selectedElement.on('click', methods.giveLove);

      $selectedElement.trigger('click');

      expect(methods.showLove.calls.count()).toEqual(1);
      expect(methods.giveLove.calls.count()).toEqual(1);
    });

    it('should be able to remove one event handler of an HTML element', function() {
      $selectedElement.off();
      $selectedElement.on('click', methods.showLove);
      $selectedElement.on('click', methods.giveLove);
      $selectedElement.off('click', methods.giveLove);
      $selectedElement.on('dblclick', methods.giveLove);

      $selectedElement.click();

      expect(methods.showLove.calls.count()).toEqual(1);
      expect(methods.giveLove.calls.count()).toEqual(0);
    });

    it('should be able to remove all events of a HTML element', function() {
      $selectedElement.off();

      $selectedElement.on('click', methods.showLove);
      $selectedElement.on('click', methods.giveLove);
      $selectedElement.on('hover', methods.showLove);

      $selectedElement.off();

      var eventHover = new Event('hover');
      var eventClick = new Event('click');

      selectedElement.dispatchEvent(eventClick);
      selectedElement.dispatchEvent(eventHover);

      expect(methods.showLove).not.toHaveBeenCalled();
      expect(methods.giveLove).not.toHaveBeenCalled();
    });

    it('should be able to add handler for few events at once', function() {
      $selectedElement.off();

      $selectedElement.on('click dblclick', methods.showLove);
      $selectedElement.on('click', methods.giveLove);

      $selectedElement.click().dblclick();

      expect(methods.showLove.calls.count()).toEqual(2);
      expect(methods.giveLove.calls.count()).toEqual(1);
    });

    it('should trigger a click event on a HTML element', function() {
      $selectedElement.off();
      $selectedElement.on('click', methods.showLove);

      $selectedElement.trigger('click');

      expect(methods.showLove.calls.count()).toBe(1);
    });

    it('should delegate an event to elements with a given css class name', function() {
      $selectedElement.delegate('.ev', 'click', methods.showLove);
      j('.ev').trigger('click');

      expect(methods.showLove.calls.count()).toEqual(1);
    });

  });


  describe('Helper Function', function() {
    var cat, dog, bound;

    beforeEach(function() {
      cat = {
        happiness: 0,
        makeHappier: function(value, ectraHappiness) {
          this.happiness += value || 1;
          this.happiness += ectraHappiness * 10 || 0;
          return this.happiness;
        },
        checkHappiness: function() {
          return this.happiness;
        }
      };

      dog = { happiness: 10};
    });

    it('bind(fun, context) should pass the context to the function',function(){
      cat.makeHappier();
      expect(cat.checkHappiness()).toEqual(1);

      bound = j.bind(cat.checkHappiness, dog);
      expect(bound()).toEqual(10);

    });

    it('bind(fun, context [, params..]) should pass the context with parameters to the function',function(){
      cat.makeHappier();
      expect(cat.checkHappiness()).toEqual(1);

      bound = j.bind(cat.makeHappier, dog, 100);
      expect(bound()).toEqual(110);

      bound = j.bind(cat.makeHappier, dog, 100);
      // Adding aditional parameter
      expect(bound(10)).toEqual(310);
    });

    it('bind(fun, context) should return a function with prototype of context object',function(){
      var Animal = function() {};

      bound = j.bind(Animal, {});
      expect(bound.prototype.constructor).toBe(Animal);
    });

    it("filter(arr, callback) should create new array with all elements checked by callback function", function () {
      var arr = [0, 1, 2, 3];
      var result = j.filter(arr, function(value, index, array) {
        return value % 2 === 0;
      });
      expect(arr).toEqual([0, 1, 2, 3]);
      expect(result).toEqual([0, 2]);
    });

    it("clone(obj) should create a copy of passed object", function () {
      var arr = [0, 1, 2, 3];
      var arrCopy = j.clone(arr);
      expect(arr).not.toBe(arrCopy);
      expect(arr).toEqual(arrCopy);

      var obj = {a: 1, b: 2, c: 3};
      var objCopy = j.clone(obj);
      expect(obj).not.toBe(objCopy);
      expect(obj).toEqual(objCopy);

      obj = {a: 1, b: 2, c: 3, d: {e: 4}};
      objCopy = j.clone(obj);

      expect(obj).not.toBe(objCopy);
      expect(obj).toEqual(objCopy);
      // Change initial obj deep value
      obj.d.e = 5;
      // Check that the copy is not deep and the objCopy is also has been changed by the ref
      expect(obj).not.toBe(objCopy);
      expect(obj).toEqual(objCopy);
    });

    it("deepClone(obj) should create a deep copy of passed object", function () {
      var arr = [0, 1, {a: [1, 3, 4]}, 3];
      var arrCopy = j.deepClone(arr);
      expect(arr).not.toBe(arrCopy);
      expect(arr).toEqual(arrCopy);

      var obj = {a: 1, b: 2, c: 3, d: {e: 4}};
      var objCopy = j.deepClone(obj);

      expect(obj).not.toBe(objCopy);
      expect(obj).toEqual(objCopy);
      // Change initial obj deep value
      obj.d.e = 5;
      // Check that the copy is deep and there is no changes in the objCopy onject
      expect(obj).not.toBe(objCopy);
      expect(obj).not.toEqual(objCopy);
    });

  });

});
