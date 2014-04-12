define(['BaseModel'], function(BaseModel) {
  "use strict";

  // Description: Listen for webRequests in the background and send message to dev tools extension
  return BaseModel.extend({

    defaults: {
      urls: ["*://*/*http-bind*"],
      types: ["xmlhttprequest"],
      tabId: chrome.devtools.inspectedWindow.tabId,
      name: "port:" + chrome.devtools.inspectedWindow.tabId
    },

    connection: false,

    initialize: function(){
      console.log("[Stream] initialize");
      this.addListeners();
    },
    
    addListeners: function(){      
      console.log("[Stream] addListeners");
      var _this = this;     

      this.on("beforeRequest", function(data){
        this.handleBeforeRequest(data);
      });

    },

    connect: function(){
      var _this = this;
      this.connection = chrome.runtime.connect({name: "port:" + this.get("tabId") });
      this.connection.postMessage({action: "add:listener", manifest: this.toJSON()});
      this.connection.onMessage.addListener(function(msg) {
        console.log("message:received", msg);
        _this.trigger(msg.state, msg)
      });

    },

    // todo: store the network requests and their states as objects on this stream
    //  for now just append the content to get this party started
    handleBeforeRequest: function(data){
      this.trigger("request:sent", data.requestBody);
    }


  });
});
