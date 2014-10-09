define(["BaseModel"], function(BaseModel) {
  "use strict";

  return BaseModel.extend({

    defaults: {
      enable: false,
      format: "text",
      scheme: "*",
      host: "*",
      path: "*",
    },

    initialize: function(){
      console.log("[Bookmark] initialize");
    }

  });
});
