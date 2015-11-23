describe("JSimpler", function() {

  var jsdom = require("jsdom");
  window = jsdom.jsdom().defaultView;
  document = window.document;
  var $ = require("jquery");

  require("../jsimpler");
  JSimpler().setContext(window);

  var initDom = function() {
    $("body").append(
      $("<div>")
        .prop({id:"divId", name: "divName"})
        .addClass("divClass")
        .css({color: "red", width: "300px"})
        .append(
          $("<p>").append("paragraph 1")
        )
        .append(
          $("<p>").append("paragraph 2")
        )
    );
    //console.log($("p").text());
  };
  initDom();

  it("should be defined", function() {
    expect(JSimpler).toBeDefined();
  });

  describe("can select elements", function() {

    beforeEach(function() {
    });

    it("by the tag name", function() {
      expect(JSimpler("div").get()[0]).toBe(document.querySelectorAll("div"));
      expect(JSimpler("p").size()).toBe(2);
    });

    it("by id: JSimpler('#id')", function() {
      expect(JSimpler("#div").get()).toBe();
    });

    it("by id: JSimpler('#id')", function() {
      expect(typeof JSimpler).toBe("function");
    });

  });

});
