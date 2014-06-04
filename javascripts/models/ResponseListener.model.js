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
      console.log("[Stream] addListeners");

      // init the connection
      this._connection = chrome.runtime.connect({name: this.webRequestManifest().name });
      this._connection.onMessage.addListener(this._handleBackgroundEvent.bind(this));

      this.sendToBackground({ 
        event: "add:listener", 
        data: this.webRequestManifest() 
      });

      // Description: Handle the message sent from the background page
      this.on("stream:update", function(data){
        this.handleBeforeRequest(data);
      });

      this.on("tab:updated:complete", function(data){
        this.handleTabUpdated(data);
      });

      this.listenToRequestFinished();

    },

    _handleBackgroundEvent: function(event){
      console.info( "[responselistener] handle background event", event );

      if( event.event ){
        // event
        this.trigger( event.event, event.data );
      }else{
        // sync
        this.set(event.data);
      }
    },
    
    // Description: Listen to finished netowrk requests
    // todo: clean up listeners in devtools on close that are not in the background?
    // todo: review background.js for possible memory leaks
    // todo: clear console on refresh events and navigation?
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

    // todo: store the network requests and their states as objects on this stream
    //  for now just append the content to get this party started
    handleBeforeRequest: function(data){

      var guid = Utils.guidGen();
      this.networkEvents.add({id: guid, type:'beforeRequest', data: data, body: data.requestBody});
      this.trigger("request:sent", {id: guid, body: data.requestBody} );
    },

    handleTabUpdated: function(data) {
      this.trigger("tab:updated");
    },

    webRequestManifest: function(){
      console.info( "WRFilter", this.generateWebRequestFilter() )
      return {
        scheme  : this.get("scheme"),
        host    : this.get("host"),
        path    : this.get("path"),
        types   : ["xmlhttprequest"],
        tabId   : this.get("tabId"),
        name    : this.get("backgroundConnectionName")
      };
    },

    sendToBackground: function( data ){
      if( this._connection && this._connection.postMessage ){
        try{
          this._connection.postMessage(data);
        }catch( e ){
          console.error(e.stack);
          debugger;
        }
      }
    }

  });
});
