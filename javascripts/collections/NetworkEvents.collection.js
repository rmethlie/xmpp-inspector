define(['BaseCollection', 'NetworkEvent'], function(BaseCollection, NetworkEvent) {
  "use strict";
     
  return BaseCollection.extend({
    
    model: NetworkEvent,
    

    initialize: function(){
      console.log("[NetworkEvents] initialize");
    },

  });
});
