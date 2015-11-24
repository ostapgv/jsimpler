describe("JSimpler", function() {

  it("should be defined", function() {
    expect(JSimpler).toBeDefined();
  });

  describe("selector", function() {

    beforeEach(function() {
    });

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

});
