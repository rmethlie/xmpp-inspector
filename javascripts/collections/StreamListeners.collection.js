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

      // event triggered by stream listener models
      this.on("stream:update", function(data){
        var port = "port:" + data.tabId;

        if(this.ports[port])
          this.ports[port].postMessage(data);
        else
          console.log("++++++ Tried to send a meessage to a non-existant port ++++++++");
      });

      this.on("tab:updated:complete", function(tabId){
        var port = "port:" + tabId;

        if(this.ports[port])
          this.ports[port].postMessage({state: "tab:updated:complete", tab: tabId});
      });

      chrome.runtime.onConnect.addListener(function(port) {
        console.log("connected", port);
        
        _this.ports[port.name] = port;
          
        _this.messageHandlers[port.name] = port.onMessage.addListener(function(message) {
          _this.onMessage(message);
        });

        // todo: trigger removeListener when the inspector panel is closed
        //  also try tab/window is closed
        port.onDisconnect.addListener(function(){
          console.log("[StreamListeners] chrome.onDisconnect", _this);
          _this.onDisconnect(port);
        });
      });

      chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
        if (changeInfo.status === 'complete') {
            _this.trigger("tab:updated:complete", tabId);
        }
      });

    },

    onDisconnect: function(port){
      // console.log("[StreamListeners] onDisconnect", port);
      // console.log("[StreamListeners] onDisconnect this", this);
      // console.log("[StreamListeners] onDisconnect this.messageHandlers", this.messageHandlers);
      var streamListener = this.findWhere({name: port.name});
      streamListener.removeListeners();
      this.remove(streamListener);
      port.onMessage.removeListener(this.messageHandlers[port.name]);
      this.ports[port.name] = null;
      delete this.ports[port.name];
    },

    onMessage: function(message) {
      console.log("[StreamListeners] onMessage")   ;
      var action = message.action;
        switch(action){
          case "add:listener":
            console.log("add:listener");
            this.add(message.manifest);
            break;
        }
    }



  });
});
