define(['BaseModel', 'NetworkEvents', 'Stream', 'BaseCollection', 'lib/utils'],
  function(BaseModel, NetworkEvents, Stream, BaseCollection, Utils) {
  "use strict";

  var inspectedTabId = chrome.devtools.inspectedWindow.tabId;

  // Description: Listen for webRequests in the background and send message to dev tools extension
  return BaseCollection.extend({

    tabId: inspectedTabId,

    backgroundConnectionName: "port:" + inspectedTabId,

    _connection: null,  //connection to background page
    
    // model: ResponseListener,
    model: Stream,
    
    networkEvents: null,

    initialize: function(){
      console.log("[Streams] initialize");
      this.networkEvents = new NetworkEvents();
      this.addListeners();
    },
    
    addListeners: function(){
      console.log("[Streams] addListeners");

      // init the connection
      this._connection = chrome.runtime.connect({name: this.backgroundConnectionName });
      this._connection.onMessage.addListener(this._handleBackgroundEvent.bind(this));

      // Description: Handle the message sent from the background page
      this.on("request:before", function(data){
        this.handleBeforeRequest(data);
      });
      
      this.on("request:finished", function(response){
        this.handleRequestFinished(response);
      });

      // this.on("add", function(stream){
      //   console.log("add stream", stream);
      //   this.sendToBackground({
      //     event: "add:listener",
      //     data: this.webRequestManifest(stream)
      //   });
      // });

      // this.on("reset", function(listener){
      //   console.log("reset", listener);
      // });

      this.on("remove", function(stream, collection, options){
        console.log("remove responseListener", stream);
        stream.stopListening();
      });
    },

    _handleBackgroundEvent: function(event){
      console.info( "[streams] handle background event", event );

      if( event.event ){
        // event
        this.trigger( event.event, event.data );
      }else{
        // sync
        this.set(event.data);
      }
    },

    handleRequestFinished: function(response){
      this.networkEvents.add(response);
    },

    handleBeforeRequest: function(data){
      var guid = Utils.guidGen();
      this.networkEvents.add({
        id: guid, 
        type:'beforeRequest', 
        data: data, 
        body: data.requestBody,
        timestamp: data.timestamp,
        format: data.format
        url: data.info.url
      });

      this.trigger("request:sent", {
        id: guid,
        body: data.requestBody,
        format: data.format,
        url: data.info.url
      });
    },

    // webRequestManifest: function(listener){
    //   console.info( "webRequestManifest");
    //   return {
    //     scheme  : listener.get("scheme"),
    //     host    : listener.get("host"),
    //     path    : listener.get("path"),
    //     format  : listener.get("format"),
    //     types   : ["xmlhttprequest"],
    //     tabId   : this.tabId,
    //     name    : this.backgroundConnectionName
    //   };
    // },

    // sendToBackground: function(data){
    //   if( this._connection && this._connection.postMessage ){
    //     try{
    //       this._connection.postMessage(data);
    //     }catch( e ){
    //       console.error(e.stack);
    //     }
    //   }
    // },

    updateStream: function(params){
      // find the stream
      // update it silently
      var stream = this.last();
      if(stream)
        stream.set(params, {silent: true});
    }

  });
});
