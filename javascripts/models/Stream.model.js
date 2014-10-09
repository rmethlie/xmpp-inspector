define(['BaseModel', 'ResponseListener', 'lib/utils'], function(BaseModel, ResponseListener, Utils) {
  "use strict";

  // Description: Listen for webRequests in the background and send message to dev tools extension
  return BaseModel.extend({

    _connection: null,  //connection to background page

    defaults :{
      scheme: "*", 
      host: "*", 
      path: "http-bind",
      tabId: chrome.devtools.inspectedWindow.tabId,
      backgroundConnectionName: "port:" + chrome.devtools.inspectedWindow.tabId,
    },

    generateWebRequestFilter: function(){
      return [ this.get("scheme") + "://" + this.get("host") +  "/*" + this.get("path") + "*" ];
    },


    initialize: function(){
      console.log("[Stream] initialize");
      this.responseListener = new ResponseListener({stream: this});
      this.addListeners();
    },
    
    addListeners: function(){
      console.log("[Stream] addListeners");

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
      this.trigger("request:finished", {id: response.id, body: response.body});
    },

    handleBeforeRequest: function(data){
      var guid = Utils.guidGen();
      this.trigger("request:sent", {id: guid, body: data.requestBody} );
    },

    webRequestManifest: function(){
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
