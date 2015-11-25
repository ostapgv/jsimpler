describe('JSimpler', function() {

  it('should be defined', function() {
    expect(JSimpler).toBeDefined();
  });

  describe('Selector', function() {
    'use strict';

    it('should select an empty array if the element does not exist in DOM', function() {
      var selector = '.some-element-not-in-the-dom';

      // We're calling $.makeArray because we need to transform jQuery result set into real array object
      var expectedSelectedElement = $.makeArray($(selector));
      var selectedElements = $.makeArray(JSimpler(selector));

      expect(selectedElements).toEqual(expectedSelectedElement);
      expect(selectedElements.length).toBe(0);
    });

    it('should select a DOM element with given ID', function() {
      var id = 'divId';
      var expectedSelectedElement = $.makeArray($('#' + id));
      var selectedElement = $.makeArray(JSimpler('#' + id));

      expect(selectedElement).toEqual(expectedSelectedElement);
      expect(selectedElement.length).toBe(1);
      expect(selectedElement[0] instanceof HTMLElement).toBe(true);
      expect(selectedElement[0]).toBe(expectedSelectedElement[0]);
      expect(selectedElement[0].id).toBe(id);
    });

    it('should select DOM elements with a given class name', function() {
      var className = '.infinum';
      var expectedHTMLElementsArray = $.makeArray($(className));
      var selectedElementsArray = $.makeArray(JSimpler(className));

      expect(selectedElementsArray.length).toBe(expectedHTMLElementsArray.length);

      // We need to check for each element if it's in the expected result set because element order is not guaranteed
      selectedElementsArray.forEach(function(element) {
        expect(expectedHTMLElementsArray.indexOf(element)).not.toBe(-1);
      });
    });

    it('should select DOM elements with a given tag name', function() {
      var tagName = 'p';
      var expectedHTMLElementsArray = $.makeArray($(tagName));
      var selectedElementsArray = $.makeArray(JSimpler(tagName));

      expect(selectedElementsArray.length).toBe(expectedHTMLElementsArray.length);

      selectedElementsArray.forEach(function(element) {
        expect(expectedHTMLElementsArray.indexOf(element)).not.toBe(-1);
      });
    });

    it('should throw an expection for invalid selector', function() {
      expect(function() {
        JSimpler(')(?/');
      }).toThrow();
    });

  });


  describe('.css()', function() {
    var J = JSimpler;
    var $selectedElement;
    var selectedElement;

    beforeEach(function() {
      J = JSimpler;
      $selectedElement = J('#main-part');
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
      $selectedElement.css('display', 'none');
      expect($selectedElement.css('display')).toBe('none');
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

});
