define(['BaseModel', 'NetworkEvents', 'lib/utils'], function(BaseModel, NetworkEvents, Utils) {
  "use strict";

  // Description: Listen for webRequests in the background and send message to dev tools extension
  return BaseModel.extend({

    defaults: {
      // urls: ["*://*/*http-bind*"],
      urls: [],
      types: ["xmlhttprequest"],
      tabId: chrome.devtools.inspectedWindow.tabId,
      name: "port:" + chrome.devtools.inspectedWindow.tabId
    },

    // todo: make configurable and tied to the web request filter
    urlPattern: "",
<<<<<<< HEAD
    networkRequestPattern: "",
=======
>>>>>>> 41c04590a500e66a50edece56f60dd4f5464feb2

    // Description: accept URL parameters for web request listener as descirbed in 
    //  https://developer.chrome.com/extensions/match_patterns 
    //  and generate a pattern testable for regex for network request event
    setPattern: function(params){
      var scheme  = params.scheme.replace("*", ".*");
      var host    = params.host.replace("*", ".*");
      var path    = params.path.replace("*", ".*").replace("/", "\/");
      var pattern = scheme + "://" + host + "/" + path;

      this.get("urls").push(params.scheme + "://" + params.host + "/" + params.path);
<<<<<<< HEAD
      this.networkRequestPattern = pattern;
=======
      this.urlPattern = pattern;
>>>>>>> 41c04590a500e66a50edece56f60dd4f5464feb2
    },

    // todo: Add unit testing
    // testPattern: function(url){
    //   var p = this.setPattern({scheme: "http*", host: "*g*", path: "*http-bind*"});
    //   var urlPattern = new RegExp( p, "i");
    //   return urlPattern.test( url );
    // },

    connection: false,

    networkEvents: new NetworkEvents(),

    initialize: function(){
      console.log("[Stream] initialize");
      this.setPattern({scheme: "http", host: "*", path: "*http-bind*"});
      this.addListeners();
    },
    
    addListeners: function(){
      console.log("[Stream] addListeners");
      var _this = this;

      // Description: Handle the message sent from the background page
      this.on("beforeRequest", function(data){
        this.handleBeforeRequest(data);
      });

      this.on("tab:updated:complete", function(data){
        this.handleTabUpdated(data);
      });

      this.listenToRequestFinished();

    },
    
    // Description: Listen to finished netowrk requests
    // todo: clean up listeners in devtools on close that are not in the background?
    // todo: review background.js for possible memory leaks
    // todo: clear console on refresh events and navigation?
    // !!!: Losing content when going from external debug window to nested
    listenToRequestFinished: function(){
      var _this = this;
      var urlPattern = new RegExp( this.networkRequestPattern, "i");

      chrome.devtools.network.onRequestFinished.addListener(function(packet){
        try{
          
          if( urlPattern.test( packet.request.url ) ){
            packet.getContent( function(contents){
              var guid = Utils.guidGen();
              _this.networkEvents.add({id: guid, type:'requestFinished', data: packet, body: contents});
              _this.trigger("request:finished", {id: guid, body: contents} );
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
        _this.trigger(msg.state, msg);
      });

    },

    // todo: store the network requests and their states as objects on this stream
    //  for now just append the content to get this party started
    handleBeforeRequest: function(data){
      var guid = Utils.guidGen();
      this.networkEvents.add({id: guid, type:'beforeRequest', data: data, body: data.requestBody});
      this.trigger("request:sent", {id: guid, body: data.requestBody} );
    },

    handleTabUpdated: function(data) {
      this.trigger("tab:updated");
    }


  });
});
