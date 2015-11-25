describe('JSimpler', function() {
  'use strict';

  var J = JSimpler;
  var $selectedElement;
  var selectedElement;

  it('should be defined', function() {
    expect(J).toBeDefined();
  });


  describe('Selector', function() {

    it('should select an empty array if the element does not exist in DOM', function() {
      var selector = '.some-element-not-in-the-dom';

      // We're calling $.makeArray because we need to transform jQuery result set into real array object
      var expectedSelectedElement = $.makeArray($(selector));
      var selectedElements = $.makeArray(J(selector));

      expect(selectedElements).toEqual(expectedSelectedElement);
      expect(selectedElements.length).toBe(0);
    });

    it('should select a DOM element with given ID', function() {
      var id = 'divId';
      var expectedSelectedElement = $.makeArray($('#' + id));
      var selectedElement = $.makeArray(J('#' + id));

      expect(selectedElement).toEqual(expectedSelectedElement);
      expect(selectedElement.length).toBe(1);
      expect(selectedElement[0] instanceof HTMLElement).toBe(true);
      expect(selectedElement[0]).toBe(expectedSelectedElement[0]);
      expect(selectedElement[0].id).toBe(id);
    });

    it('should select DOM elements with a given class name', function() {
      var className = '.infinum';
      var expectedHTMLElementsArray = $.makeArray($(className));
      var selectedElementsArray = $.makeArray(J(className));

      expect(selectedElementsArray.length).toBe(expectedHTMLElementsArray.length);

      // We need to check for each element if it's in the expected result set because element order is not guaranteed
      selectedElementsArray.forEach(function(element) {
        expect(expectedHTMLElementsArray.indexOf(element)).not.toBe(-1);
      });
    });

    it('should select DOM elements with a given tag name', function() {
      var tagName = 'p';
      var expectedHTMLElementsArray = $.makeArray($(tagName));
      var selectedElementsArray = $.makeArray(J(tagName));

      expect(selectedElementsArray.length).toBe(expectedHTMLElementsArray.length);

      selectedElementsArray.forEach(function(element) {
        expect(expectedHTMLElementsArray.indexOf(element)).not.toBe(-1);
      });
    });

    it('should throw an expection for invalid selector', function() {
      expect(function() {
        J(')(?/');
      }).toThrow();
    });

  });


  describe('.css()', function() {

    beforeEach(function() {
      $selectedElement = J('#mainPart');
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
        'height': '100px',
        'display': 'block'
      });

      expect($selectedElement.css('display')).toBe('block');
      expect($selectedElement.css('height')).toBe('100px');
    });

    it('should properly set CSS properties if called multiple times on different HTML elements', function() {
      var $anotherEl = J('.right-menu');

      $selectedElement.css('height', '100px');
      $anotherEl.css('color', 'grey');

      expect($selectedElement.css('height')).toBe('100px');
      expect($selectedElement.css('color')).not.toBe('grey');
      expect($anotherEl.css('color')).toBe('grey');
    });

    it('should return first CSS property if multiple elements selector applied', function() {
      var $li = J('.right-menu li');
      var $firstLi = J('.right-menu li:first-child');

      $li.css('color', 'yellow');
      $firstLi.css('color', 'black');

      expect($firstLi.css('color')).toBe('black');
      expect($li.css('color')).toBe('black');
    });

  });


  describe('class manipulations (addClass, removeClass, toggleClass, hasClass)', function() {

    beforeEach(function() {
      $selectedElement = J('#mainPart');
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

  });


  describe('dom manipulation', function() {
    var $selectedElement, selectedElement;

    beforeEach(function() {
      $selectedElement = J('#domManipulations');
      selectedElement = $selectedElement[0];
    });

    it('should be able to remove a HTML element', function() {
      var $toRemoveElement = J('#toRemove');
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

      var bothElements = J("#domManipulations div");
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

  });

});
