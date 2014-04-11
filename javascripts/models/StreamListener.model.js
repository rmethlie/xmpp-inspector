define(['BaseModel'], function(BaseModel) {
  "use strict";

  // Description: Listen for webRequests in the background and send message to dev tools extension
  return BaseModel.extend({

    defaults: {
      urls: ["*://*/*http-bind*"],
      types: ["xmlhttprequest"],
      tabId: -1
    },

    requestHandlers: {
    },

    onBeforeRequest: function(info) {
      this.trigger("stream:update", {tabId:this.get("tabId"), state:"beforeRequest", payload:info});            
    },

    initialize: function(){
      console.log("[StreamListener] initialize");
      // bind(this.onBeforeRequest)
      this.requestHandlers.onBeforeRequest = this.onBeforeRequest.bind(this);
      this.listenToBeforeRequest();
      // this.listenToSendHeaders();
      // this.listenToCompleted();
    },

    removeListeners: function(){
      console.log("[StreamListener] removeListeners");
      var handlers = this.requestHandlers;
      for(var handle in handlers){
        console.log("handlers:", handlers);
        console.log("handle:", handle);
        console.log("handlers[handle]:", handlers[handle]);

        chrome.webRequest[handle].removeListener(handlers[handle]);
      }
    },

    listenToBeforeRequest: function(){
      // Get the request body
      var _this = this;
      // this.requestHandlers.onBeforeRequest = 
      chrome.webRequest.onBeforeRequest.addListener(
          _this.requestHandlers.onBeforeRequest,
          // filters
          {
            urls  : _this.get("urls"),
            types : _this.get("types"),
            tabId : _this.get("tabId")
          },
          ["requestBody"]
      );
    },
    
    listenToSendHeaders: function(){
      // get request headers (after everyone has had a chance to change them)
      var _this = this;
      this.requestHandlers.onSendHeaders = chrome.webRequest.onSendHeaders.addListener(
          function(info) {
          },
          // filters
          {
            urls  : _this.get("urls"),
            types : _this.get("types"),
            tabId : _this.get("tabId")
          }, 
          ["requestHeaders"]
      );
    },
    
    listenToCompleted: function(){
      // get response headers, http status & response
      // chrome.webRequest.onResponseStarted.addListener()
      var _this = this;
      this.requestHandlers.onCompleted = chrome.webRequest.onCompleted.addListener(
          function(info) {

          },
          // filters
          {
            urls  : _this.get("urls"),
            types : _this.get("types"),
            tabId : _this.get("tabId")
          },
          ["responseHeaders"]
      );
    }

  });
});
