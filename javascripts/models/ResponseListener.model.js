define(['BaseModel', 'NetworkEvents', 'lib/utils'], function(BaseModel, NetworkEvents, Utils) {
  "use strict";

  // Description: Listen for webRequests in the background and send message to dev tools extension
  return BaseModel.extend({

    _connection: null,  //connection to background page

    defaults :{
      scheme: "http", 
      host: "*", 
      path: "http-bind",
      tabId: chrome.devtools.inspectedWindow.tabId,
      backgroundConnectionName: "port:" + chrome.devtools.inspectedWindow.tabId,
    },

    generateWebRequestFilter: function(){
      //["*://*/*http-bind*"]
      return [ this.get("scheme") + "://" + this.get("host") +  "/*" + this.get("path") + "*" ];
    },

    generateWebRequestPattern: function(){

      var 
      host = this.get("host"),
      scheme = this.get("scheme"),
      path = this.get("path"),
      pattern = null;

      // do the work...

      scheme = scheme.replace(/\*+/g, ".*");

      if((host = host.replace(/\*+/g, ".*")).length === 0){
        host = ".*";
      }

      path = path.replace(/\*+/g, ".*").replace(/\//g, "\/");
      
      pattern = scheme + ":\/\/" + host;
      if(path.length){
        pattern += "\/*" + path + "*";
      }

      return pattern;

    },

    // todo: Add unit testing
    // testPattern: function(url){
    //   var p = this.setPattern({scheme: "http*", host: "*g*", path: "*http-bind*"});
    //   var urlPattern = new RegExp( p, "i");
    //   return urlPattern.test( url );
    // },


    networkEvents: new NetworkEvents(),

    initialize: function(){
      console.log("[Stream] initialize");
      this.addListeners();
    },
    
    addListeners: function(){
      console.log("[ResponseListener] addListeners");
      this.listenToRequestFinished();

    },
    
    // Description: Listen to finished network requests
    // todo: clean up listeners in devtools on close that are not in the background?
    // todo: review background.js for possible memory leaks
    // !!!: Losing content when going from external debug window to nested
    listenToRequestFinished: function(){

      chrome.devtools.network.onRequestFinished.addListener(function(packet){
        try{
          console.info( "WRPattern", this.generateWebRequestPattern() );
          var urlPattern = new RegExp( this.generateWebRequestPattern(), "ig");
          if( urlPattern.test( packet.request.url ) ){
            packet.getContent( function(contents){
              var guid = Utils.guidGen();
              this.networkEvents.add({id: guid, type:'requestFinished', data: packet, body: contents});
              this.trigger("request:finished", {id: guid, body: contents} );
            }.bind(this));
          }else{
            console.info( "failed", packet.request.url );
          }
        }catch( e ){
          console.error( e.stack, true );
        }
      }.bind(this));
    },

  });
});
