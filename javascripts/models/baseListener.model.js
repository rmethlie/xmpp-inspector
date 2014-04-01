define(function(require, exports, module) {
  "use strict";

  // External dependencies.
  var Backbone = require("backbone");

  // Defining the application router.
  module.exports = Backbone.Model.extend({
    initialize: function(){
      console.log("[BaseListener] initialize");
    }
  });
});
