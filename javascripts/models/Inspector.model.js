define(["BaseModel", "Streams"], function(BaseModel, Streams) {
  "use strict";

  // Description: A Packet instance represents the state of a request when at 
  //  givent point (event name) in the request lifecycle
  return BaseModel.extend({

    default: {
      state: null
    },
    
    streams: new Streams(),
    
    initialize: function(){
      console.log("[Inspector] initialize");
    }

  });
});
