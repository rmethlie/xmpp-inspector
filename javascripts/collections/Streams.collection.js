define(['BaseModel', 'Stream', 'NetworkEvents', 'ResponseListener', 'BaseCollection', 'lib/utils'], 
  function(BaseModel, Stream, NetworkEvents, ResponseListener, Utils) {
  "use strict";

  // Description: Listen for webRequests in the background and send message to dev tools extension
  return BaseModel.extend({

    _connection: null,  //connection to background page
    
    model: Stream,
    
    networkEvents: new NetworkEvents(),

    responseListeners: new BaseCollection(),

    initialize: function(){
      console.log("[Streams] initialize");
      this.addListeners();
    },
    
    addListeners: function(){
      console.log("[Streams] addListeners");

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
      
      this.listenTo(this.responseListener, "request:finished", function(response){
        this.handleRequestFinished(response);
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
      this.trigger("request:finished", {id: response.id, body: response.body});
    },

    handleBeforeRequest: function(data){
      var guid = Utils.guidGen();
      this.networkEvents.add({id: guid, type:'beforeRequest', data: data, body: data.requestBody});
      this.trigger("request:sent", {id: guid, body: data.requestBody} );
    },

    webRequestManifest: function(){
      console.info( "webRequestManifest");
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
        }
      }
    }

  });
});
