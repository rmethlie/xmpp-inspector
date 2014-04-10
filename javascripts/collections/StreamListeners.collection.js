define(['backbone', 'StreamListener'], function(Backbone, StreamListener) {
  "use strict";
     
  return Backbone.Collection.extend({
    model: StreamListener,

    initialize: function(){
      console.log("[StreamListeners] initialize");
      this.addListeners();
    },

    addListeners: function(){
      var _this = this;
      chrome.runtime.onMessage.addListener(
        function(message, sender, sendResponse) {
          // this.add(new Stream(message));
          // console.log("got a message", message, sender);
          // sendResponse("StreamListener created");
          var action = message.action
          switch(action){
            case "add:listener":
              _this.add(message.manifest);
              break;
          }
      });
    }


  });
});
