define(["BaseModel"], function(BaseModel) {
  "use strict";

  // Description: A Packet instance represents the state of a request when at 
  //  givent point (event name) in the request lifecycle
  return BaseModel.extend({

    initialize: function(){
      console.log("[Packet] initialize");
    }

  });
});
