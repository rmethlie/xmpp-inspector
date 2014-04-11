define(['backbone', 'StreamListener'], function(Backbone, StreamListener) {
  "use strict";
     
  return Backbone.Collection.extend({
    
    model: StreamListener,
    
    connection: false,

    initialize: function(){
      console.log("[StreamListeners] initialize");
      this.addListeners();
    },

    addListeners: function(){
      var _this = this;

      this.on("stream:update", function(data){
        console.log("stream:update");
        this.connection.postMessage(data);
      });

      chrome.runtime.onConnect.addListener(function(port) {
        console.log("connected", port);
        _this.connection = port;
        _this.connection.onMessage.addListener(function(message) {
          _this.onMessage(message);
        });
      });

    },

    onMessage: function(message) {
      console.log("[StreamListeners] onMessage")   ;
      var action = message.action
        switch(action){
          case "add:listener":
            console.log("added");
            this.add(message.manifest);
            break;
        }    
    }



  });
});
