define(['backbone'], function(Backbone) {
  "use strict";

  return Backbone.Model.extend({

    initialize: function(){
      console.log("[BaseModel] initialize");
    },

    getTimestamp: function(){
      return Date.now();
    },

  });
});
