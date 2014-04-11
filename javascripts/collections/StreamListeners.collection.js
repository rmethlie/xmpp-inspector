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
        var port = "port:" + data.tabId;
        console.log("sending message on: port:"+data.tabId, this.ports);
        if(this.ports[port])
          this.ports[port].postMessage(data);
        else
          console.log("++++++ Tried to send a meessage to a non-existant port ++++++++");
      });

      chrome.runtime.onConnect.addListener(function(port) {
        console.log("connected", port);
        
        _this.ports[port.name] = port;
        console.log("listening on: port:" + port.sender.tab.id);
          
        _this.messageHandlers[port.name] = port.onMessage.addListener(function(message) {
          _this.onMessage(message);
        });

        // todo: trigger removeListener when the inspector panel is closed
        //  also try tab/window is closed
        port.onDisconnect.addListener(function(){
          _this.ports[port.name] = null;
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
