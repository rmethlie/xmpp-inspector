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
    },


    listenToBeforeRequest: function(){
      // Get the request body
      var _this = this;
      chrome.webRequest.onBeforeRequest.addListener(
          function(info) {
            _this.trigger("stream:update", {tabId:_this.get("tabId"), state:"beforeRequest", payload:info});
            // _this.publish(_this.get("tabId"), "beforeRequest", info);

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
            // _this.publish(_this.get("tabId"), "sendHeaders", info);

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
            // _this.publish(_this.get("tabId"), "completed", info);

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
