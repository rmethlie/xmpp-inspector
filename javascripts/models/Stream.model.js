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

    // todo: make configurable and tied to the web request filter
    urlPattern: "http-bind",

    connection: false,

    initialize: function(){
      console.log("[Stream] initialize");
      this.addListeners();
    },
    
    addListeners: function(){      
      console.log("[Stream] addListeners");
      var _this = this;     

      // Description: Handle the message sent from the background page
      //  WebRequest listener
      this.on("beforeRequest", function(data){
        this.handleBeforeRequest(data);
      });

      this.listenToRequestFinished();

    },
    // Description: Listen to finished netowrk requests
    // todo: clean up listeners on close of devtools that are not in the background?
    // todo: review background.js for possible memory leaks
    // todo: clear console on refresh events and navigation?
    // !!!: Losing content when going from external debug window to nested
    listenToRequestFinished: function(){
      var _this = this;
      var urlPattern = new RegExp( this.urlPattern, "i");

      chrome.devtools.network.onRequestFinished.addListener(function(packet){
        try{
          
          if( urlPattern.test( packet.request.url ) ){
            packet.getContent( function(contents){
              try{
                _this.trigger("request:finished", packet, contents);
              }catch( e ){
                console.error( e.stack, true );
              }
            });
          }
        }catch( e ){
          console.error( e.stack, true );
        }
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
