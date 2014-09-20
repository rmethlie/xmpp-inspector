define(['BaseModel', 'lib/utils'], function(BaseModel, Utils) {
  "use strict";

  // Description: Listen for webRequests in the background and send message to dev tools extension
  return BaseModel.extend({

    defaults: {
      scheme: "*",
      host: "*",
      path: "http-bind",
      types: ["xmlhttprequest"],
      tabId: -1
    },

    port: null,
    
    requestHandlers: {},

    _responseListener: null,

    initialize: function(){
      console.log("[RequestListener] init");
      this.addListeners();
    },

    generateWebRequestFilter: function(){
      return [this.get("scheme")+"://"+this.get("host")+"/"+this.get("path") + "*"];
    },

    onBeforeRequest: function(info) {

      console.info( "[PGD] onBeforeRequest", info.tabId );
      var content = "";
      // note: requestBody.raw[0].bytes is an ArrayBuffer type object 
      //  but it becomes a regular object when passed to the devtools extension page.
      //  we can either parse the ArrayBuffer here or serialize it here then deserialize it
      //  in devtools page. see http://stackoverflow.com/questions/8593896/chrome-extension-how-to-pass-arraybuffer-or-blob-from-content-script-to-the-bac
      //  for details.
      if(info.requestBody)
        content = Utils.ArrayBufferToString(info.requestBody.raw[0].bytes);
      this.trigger("request:before", {
        event: "stream:update",
        data:{
          state:"beforeRequest",
          info: info,
          requestBody: content,
          format: this.get("format")
        }
      });
    },

    onCompleted: function(info) {

      console.info( "oncompleted", info );
      this.sendToResponseListener({
        event: "stream:update",
        data: {
          state:"completed",
          info: info
        }
      });
    },

    addListeners: function(){
      console.log("[StreamListener] addListeners");
      this.listenToBeforeRequest();
    },

    removeListeners: function(){
      console.log("[StreamListener] removeListeners");
      var handlers = this.requestHandlers;
      for(var handle in handlers){
        console.log("handlers:", handlers);
        console.log("handle:", handle);
        console.log("handlers[handle]:", handlers[handle]);

        chrome.webRequest[handle].removeListener(handlers[handle]);
        delete handlers[handle];
      }
    },

    listenToBeforeRequest: function(){
      // Get the request body
      this.requestHandlers["onBeforeRequest"] = this.onBeforeRequest.bind(this);

      chrome.webRequest.onBeforeRequest.addListener(
          this.requestHandlers["onBeforeRequest"],
          // filters
          {
            urls  : this.generateWebRequestFilter(),
            types : this.get("types"),
            tabId : this.get("tabId")
          },
          ["requestBody"]
      );
    },

  });
});
