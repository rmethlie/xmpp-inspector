define(['BaseModel', 'NetworkEvents', 'ResponseListener', 'ResponseListeners', 'BaseCollection', 'lib/utils'], 
  function(BaseModel, NetworkEvents, ResponseListener, ResponseListeners, BaseCollection, Utils) {
  "use strict";

  var inspectedTabId = chrome.devtools.inspectedWindow.tabId;

  // Description: Listen for webRequests in the background and send message to dev tools extension
  return BaseCollection.extend({

    tabId: inspectedTabId,

    backgroundConnectionName: "port:" + inspectedTabId,

    _connection: null,  //connection to background page
    
    model: ResponseListener,
    
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
      this.on("stream:update", function(data){
        this.handleBeforeRequest(data);
      });
      
      this.on("request:finished", function(response){
        this.handleRequestFinished(response);
      });

      this.on("add", function(listener){
        console.log("[PGD] new responseListener", listener);
        this.sendToBackground({ 
          event: "add:listener", 
          data: this.webRequestManifest() 
        });
      });
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

    handleRequestFinished: function(response){
      this.networkEvents.add(response);
    },

    handleBeforeRequest: function(data){
      var guid = Utils.guidGen();
      this.networkEvents.add({id: guid, type:'beforeRequest', data: data, body: data.requestBody});
      this.trigger("request:sent", {id: guid, body: data.requestBody} );
    },

    webRequestManifest: function(index){
      console.info( "webRequestManifest");
      if (!index){
        index = this.length ? this.length - 1 : 0;
      }
      var listener = this.at(index);
      return {
        scheme  : listener.get("scheme"),
        host    : listener.get("host"),
        path    : listener.get("path"),
        types   : ["xmlhttprequest"],
        tabId   : this.tabId,
        name    : this.backgroundConnectionName
      };
    },

    sendToBackground: function(data){
      if( this._connection && this._connection.postMessage ){
        try{
          this._connection.postMessage(data);
        }catch( e ){
          console.error(e.stack);
        }
      }
    },

    updateStream: function(params){
      // find the stream
      // update it silently
      var stream = this.last();
      if(stream)
        stream.set(params, {silent: true});
    }

  });
});
