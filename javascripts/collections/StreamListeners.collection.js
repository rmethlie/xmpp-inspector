define(['backbone', 'StreamListener'], function(Backbone, StreamListener) {
  "use strict";
     
  return Backbone.Collection.extend({
    
    model: StreamListener,
    
    ports: [],

    messageHandlers: [],

    initialize: function(){
      console.log("[StreamListeners] initialize");
      this.addListeners();
    },

    addListeners: function(){
      var _this = this;

      this.on("stream:update", function(data){
        console.log("sending message on: port:"+data.tabId, this.ports);

        this.ports["port:"+data.tabId].postMessage(data);
      });

      chrome.runtime.onConnect.addListener(function(port) {
        console.log("connected", port);
        
        _this.ports[port.name] = port;
        console.log("listening on: port:" + port.sender.tab.id);
          
        _this.messageHandlers[port.name] = port.onMessage.addListener(function(message) {
          _this.onMessage(message);
        });

        port.onDisconnect.addListener(function(){
          port.onMessage.removeListener(_this.messageHandlers[port.sender.tab.id]);
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
