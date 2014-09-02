define(['backbone', 'ResponseListener'], function(Backbone, ResponseListener) {
  "use strict";
     
  return Backbone.Collection.extend({
    
    model: ResponseListener,
    

    initialize: function(){
      console.log("[ResponseListeners] initialize");
    },

  });
});
