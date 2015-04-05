define(['backbone', 'NetworkEvent'], function(Backbone, NetworkEvent) {
  "use strict";
     
  return Backbone.Collection.extend({
    
    model: NetworkEvent,
    

    initialize: function(){
      console.log("[NetworkEvents] initialize");
    }

  });
});
