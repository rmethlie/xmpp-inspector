define(['BaseModel'], function(BaseModel) {
  "use strict";
    
    // borrowed from http://updates.html5rocks.com/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
    // for a more robust library we can always use https://github.com/inexorabletash/text-encoding
    function ArrayBufferToString(buf) {
        // !!! using Uint8Array because we are assuming utf 8 encoded
        // we should attempt to detect this if possible and accomodate other encodings using the library mentioned above
       // return String.fromCharCode.apply(null, new Uint16Array(buf));
       return String.fromCharCode.apply(null, new Uint8Array(buf));
     }

    function StringToArrayBuffer(str) {
       var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char !!!UTF-16!!!
       var bufView = new Uint16Array(buf); 
       for (var i=0, strLen=str.length; i<strLen; i++) {
         bufView[i] = str.charCodeAt(i);
       }
       return buf;
     }

  // Description: Listen for webRequests in the background and send message to dev tools extension
  return BaseModel.extend({

    defaults: {
      urls: ["*://*/*http-bind*"],
      types: ["xmlhttprequest"],
      tabId: -1
    },

    requestHandlers: {},

    onBeforeRequest: function(info) {
      var content = "";
      // note: requestBody.raw[0].bytes is an ArrayBuffer type object 
      //  but it becomes a regular object when passed to the devtools extension page.
      //  we can either parse the ArrayBuffer here or serialize it here then deserialize it
      //  in devtools page. see http://stackoverflow.com/questions/8593896/chrome-extension-how-to-pass-arraybuffer-or-blob-from-content-script-to-the-bac
      //  for details.
      if(info.requestBody)
        content = ArrayBufferToString(info.requestBody.raw[0].bytes);
      this.trigger("stream:update", {tabId:this.get("tabId"), state:"beforeRequest", payload:info, requestBody: content});            
    },

    onCompleted: function(info) {      
      this.trigger("stream:update", {tabId:this.get("tabId"), state:"completed", payload:info});            
    },

    initialize: function(){
      console.log("[StreamListener] initialize");
      this.requestHandlers.onBeforeRequest = this.onBeforeRequest.bind(this);
      this.requestHandlers.onCompleted = this.onCompleted.bind(this);
      this.listenToBeforeRequest();
      // this.listenToSendHeaders();
      this.listenToCompleted();
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
          _this.requestHandlers.onCompleted,
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
