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
      tabId: chrome.devtools.inspectedWindow.tabId,
      name: "port:" + chrome.devtools.inspectedWindow.tabId
    },

    connection: false,

    initialize: function(){
      console.log("[Stream] initialize");
      this.addListeners();
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
    
    addListeners: function(){      
      console.log("[Stream] addListeners");
      var _this = this;     

      this.on("beforeRequest", function(data){
        this.handleBeforeRequest(data);
      });

    },

    handleBeforeRequest: function(data){
      var content = "<content><message>Don't Panic: We got a request event but there was no Request Body.</message></content>";
      if(data.requestBody){
        content = ArrayBufferToString(info.requestBody.raw[0].bytes);
        // todo: store the network requests and their states as objects on this stream
        //  for now just append the content to get this party started
      }

      this.trigger("request:sent", content);
    }


  });
});
