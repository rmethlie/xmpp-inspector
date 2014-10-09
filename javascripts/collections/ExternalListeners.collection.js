define(['ExternalListener'], function(ExternalListener) {
  "use strict";
  return Backbone.Collection.extend({
    model: ExternalListener,
    initialize: function( chromeConnections, options ){
      console.log( "[ExternalListeners] Initialized.");
      this.chromeConnections = options.chromeConnections;
      this.chromeConnections.on("add", function( chromeConnection ){
        console.log( "[ExternalListeners] Detected new request listener.");
        chromeConnection.on("stream:update", this.onStreamEvent.bind(this));
      }.bind(this));
      this.listen();
    },

    list: function( filter ){
      // filter inspector rules based on 'filter' properties
      filter = filter || {}

      _.each( this.chromeConnections.models, function( chromeConnection ){
        console.log( 'connection', chromeConnection );
      });

    },

    listen: function(){
      // For long-lived connections:
      chrome.runtime.onConnectExternal.addListener(function(port) {
        var
        // create an ExternalListener model
        externalListener = this.add({
          id: port.name,
          port: port
        });

        // listen for disconnects and remove from collection
        port.onDisconnect.addListener(function(){
          this.remove(externalListener);
        }.bind(this));
        
        // listen for external messages.  mainly for registration.
        port.onMessage.addListener(this.onExternalMessage.bind(this));
      
        console.log( '[ExternalListeners] Added listener:', port.name+".", "Requesting permission.");

      }.bind(this));
      console.log( "[ExternalListeners] Listening...");
    },

    onExternalMessage: function( message ){

      switch( message.event ){

        case "register:external":
          console.log( '[ExternalListeners] Registration request.' );
          _.each( this.chromeConnections.models, function(chromeConnection){
            if( chromeConnection.sendToPanel ){
              console.log( '[ExternalListeners] Sending register request to', chromeConnection.id );
              chromeConnection.sendToPanel(message);
            }
          });
        break;

        default:
          console.warn('[ExternalListeners] Unknown external message type:', message.type);
      }
    },

    onStreamEvent: function( event ){
      console.log( "[ExternalListeners] Stream event.", event );
      _.each( this.models, function( externalListener ){
        var
        port = externalListener.get("port");
        if( port.postMessage ){
          port.postMessage(event);
        }
      })
    },


    register: function( listener ){


    }
  });
});