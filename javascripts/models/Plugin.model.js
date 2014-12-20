define(["BaseModel"], function(BaseModel) {
  "use strict";

  return BaseModel.extend({

    defaults: {
      enable: false,
      id: null,
      listensTo: "all"
    },

    initialize: function(){
      console.log("[Plugin] initialize");
    }

  });
});
