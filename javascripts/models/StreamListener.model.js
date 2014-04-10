define(['BaseModel'], function(BaseModel) {
  "use strict";

  // Description: Listen for webRequests in the background and send message to dev tools extension
  return BaseModel.extend({

    defaults: {
      urls: ["*://*/*http-bind*"],
      types: ["xmlhttprequest"],
      tabId: -1
    },

    initialize: function(){
      console.log("[StreamListener] initialize");
      this.listenToBeforeRequest();
      this.listenToSendHeaders();
      this.listenToCompleted();
      this.connectDevTools();
    },

    publish: function(tabId, type, payload){
      chrome.runtime.sendMessage({tabId: tabId, type: type, data: payload}, function(response){});
    },

    connectDevTools: function(){
      chrome.runtime.onConnect.addListener(function(devToolsConnection) {

        this.devToolsConnection = devToolsConnection;

        // assign the listener function to a variable so we can remove it later
        this.devToolsListener = function(message, sender, sendResponse) {
            
        };

        // add the listener
        this.devToolsConnection.onMessage.addListener( this.devToolsListener);

        this.devToolsConnection.onDisconnect(function() {
             this.devToolsConnection.onMessage.removeListener(this.devToolsListener);
        });
      });
    },

    listenToBeforeRequest: function(){
      // Get the request body
      var _this = this;
      chrome.webRequest.onBeforeRequest.addListener(
          function(info) {
            _this.publish(_this.get("tabId"), "beforeRequest", info);
            // var payload;
            // requestBody only available when PUT or POST
            // we should check for HTTP method used when determining payload to send back to devtools page
            // if(info.requestBody){
            //   console.log("Request Intercepted w/ body ");
            //   payload = ArrayBufferToString(info.requestBody.raw[0].bytes);
            //   console.log("payload:", payload);
            // }
            
          },
          // filters
          {
            urls  : _this.get("urls"),
            types : _this.get("types"),
            tabId : _this.get("tabId")
            // urls: ["http://green.eikonmessenger/nhttp-bind/"],
            // types: ["xmlhttprequest"]
          },
          ["requestBody"]
      );
    },
    
    listenToSendHeaders: function(){
      // get request headers (after everyone has had a chance to change them)
      var _this = this;
      chrome.webRequest.onSendHeaders.addListener(
          function(info) {
            _this.publish(_this.get("tabId"), "sendHeaders", info);

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
      chrome.webRequest.onCompleted.addListener(
          function(info) {
            _this.publish(_this.get("tabId"), "completed", info);

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
