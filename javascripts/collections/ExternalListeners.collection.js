define(['ExternalListener'], function(ExternalListener) {
  "use strict";
  return Backbone.Collection.extend({
    model: ExternalListener,
    initialize: function( chromeConnections, options ){
      console.log( "[ExternalListeners] Initialized.");
      this.chromeConnections = options.chromeConnections;
      this.chromeConnections.on({
        'add'     : this.onChromeConnectionAdded.bind(this),
        'remove'  : this.onChromeConnectionRemoved.bind(this)
      });
      this.listen();
    },

    onChromeConnectionAdded: function( connection ){
      console.log( "[ExternalListeners] Detected new request listener.", connection );
      connection.on({
        'request:finished': this.onStreamEvent.bind(this)
      });
    },

    onChromeConnectionRemoved: function( connection ){
      console.log( '[ExternalListeners] Chrome connection removed. CLEANUP!!!!' );
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
          console.log( '[ExternalListeners] Removing port on disconnect.', port.name );
          this.remove(externalListener);
        }.bind(this));
        
        // listen for external messages.  mainly for registration.
        port.onMessage.addListener(this.onExternalMessage.bind(this));
      
        console.log( '[ExternalListeners] Added listener:', port.name+".");

      }.bind(this));
      console.log( "[ExternalListeners] Listening...");
    },

    onExternalMessage: function( message, port ){

      switch( message.type ){

        case "external:register":
          console.log( '[ExternalListeners] Registration request.', port.name  );

          // _.each( this.chromeConnections.models, function(chromeConnection){
          //   if( chromeConnection.sendToPanel ){
          //     console.log( '[ExternalListeners] Sending register request to', chromeConnection.id );
          //     chromeConnection.sendToPanel(message);
          //   }
          // });
          port.postMessage({
            type: 'external:register:success',
            name: 'xmpp-inspector'
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
          console.log( 'posting external stream event to listener:', externalListener.get('port').name );
          event.type = 'external:data';
          port.postMessage(event);
        }else{
          console.log( 'could not post external event to listener' );
        }
      })
    },


    register: function( listener ){


    }
  });
});