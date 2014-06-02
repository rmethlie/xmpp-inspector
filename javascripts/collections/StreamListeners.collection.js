define(['backbone', 'StreamListener', 'Panels', 'Panel', 'lib/utils'], function(Backbone, StreamListener, Panels, Panel, Utils) {
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
      
      // event triggered by stream listener models
      this.on("stream:update", function(data){
        this.sendMessageToTab( data.tabId, "stream:update", data );
      });

      this.on("tab:updated:complete", function(tabId){
        this.sendMessageToTab( tabId, "state:update", {
          state: "tab:updated:complete", tab: tabId
        });
      });

      chrome.runtime.onConnect.addListener(Panels.add.bind(Panels));

      chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
        if (changeInfo.status === 'complete') {
            _this.trigger("tab:updated:complete", tabId);
        }
      });

    },

    sendMessageToTab: function( port, action, message ){

      // does the message have the required meta info?
      if( typeof action === "undefined" ){
        console.error( "++++++ Call to 'sendMessageToTab' missing 'action' argument. +++++++")
        return;
      }

      // is it an ID we should retrieve a mapping for, or an actual port?
      port = 
        typeof port === "string" ? 
          // its a string, so we need to find port by ID
          this.ports["port:"+port] :
          // its an object, so does it have a 'postMessage' method?
          typeof port.postMessage === "function" ? 
            port : 
            // seems invalid :(
            null;
      
      // send the message, if there's a port...
      if(port){
        port.postMessage(message);
      }else{
        console.error("++++++ Tried to send a meessage to a non-existant port ++++++++");
      }
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

          case "copy:text":
            console.log("copy:text");
            Utils.copyText(message.text);
            break;

          case "preferences:sync":
            if( message.preferences ){
              console.info( "preference:sync for ", message );
            }
            break;
        }
    }



  });
});
