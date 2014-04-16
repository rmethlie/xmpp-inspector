define(['BaseModel'], function(BaseModel) {
  "use strict";

  // Description: A Request instance represents entire lifecycle of Network request
  //  including the response.
  return BaseModel.extend({

    initialize: function(){
      console.log("[NetworkEvent] initialize");
    }

  });
});
