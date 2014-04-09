define(['BaseModel', 'Packet', 'NetworkRequest'], function(BaseModel, Packet, NetworkRequest) {
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
     
    var packet = new Packet();
    var request = new NetworkRequest();
  return BaseModel.extend({
    defaults:{
      url: "http-bind"
    },

    streams: [],

    initialize: function(){
      console.log("[BaseListener] initialize");
      chrome.runtime.onMessage.addListener(
        function(message, sender, sendResponse) {
          console.log("got a message", message, sender);
          sendResponse("response from background service");
      });
    },

    onBeforeRequest: function(stream){
      // Get the request body
      chrome.webRequest.onBeforeRequest.addListener(
          function(info) {
            var payload;
            // requestBody only available when PUT or POST
            // we should check for HTTP method used when determining payload to send back to devtools page
            if(info.requestBody){
              console.log("Request Intercepted w/ body ");
              payload = ArrayBufferToString(info.requestBody.raw[0].bytes);
              console.log("payload:", payload);
            }
            
          },
          // filters
          {
            urls: ["http://green.eikonmessenger/nhttp-bind/"],
            types: ["xmlhttprequest"]
          },
          ["requestBody"]
      );
    },
    
    onSendHeaders: function(stream){
      // get request headers (after everyone has had a chance to change them)
      chrome.webRequest.onSendHeaders.addListener(
          function(info) {

          },
          // filters
          {
            urls: ["http://green.eikonmessenger/nhttp-bind/"],
            types: ["xmlhttprequest"]
          }, 
          ["requestHeaders"]
      );
    },
    
    onCompleted: function(stream){
      // get response headers, http status & response
      // chrome.webRequest.onResponseStarted.addListener()
      chrome.webRequest.onCompleted.addListener(
          function(info) {

          },
          // filters
          {
            urls: ["http://green.eikonmessenger/nhttp-bind/"],
            types: ["xmlhttprequest"]
          },
          ["responseHeaders"]
      );
    },
    
    addStream: function(stream){
      this.onBeforeRequest(stream);
      this.onSendHeaders(stream);
      this.onCompleted(stream);
      this.streams.push(stream);
    }


  });
});
