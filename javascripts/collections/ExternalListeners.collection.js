define(['ExternalListener'], function(ExternalListener) {
  "use strict";
  return Backbone.Collection.extend({
    model: ExternalListener,
    initialize: function( streams, options ){
      console.log( "[ExternalListeners] Initialized.");
      this.sources = options.sources;
      this._waitForSources();
      this._waitForExternalListeners();
    },

    _waitForSources: function(){
      this.sources.on({
        'add'     : this.onSourceAdded.bind(this),
        'remove'  : this.onSourceRemoved.bind(this)
      });
    },

    onSourceAdded: function( source ){
      console.log( "[ExternalListeners] New streaming source detected.", source );

      /*
        Each request listener represents a URL pattern, but the external listener
        may not know anything about URLs, so they are identified more generically
        as 'channels'. 
      */
      source.requestListeners.on({

        // Channel (URL Pattern, AKA RequestListener) added.
        'add': function( channel ){
          console.log('[ExternalListeners] Channel added to connection.', channel );
          this.sendToExternalListeners({
            type: 'source:channel:added',
            source: source.id,
            channel: channel
          });
        }.bind(this),

        // Channel removed.
        'remove': function( channel ){
          console.log('[ExternalListeners] Channel removed from connection.', channel );
          this.sendToExternalListeners({
            type: 'source:channel:removed',
            source: source.id,
            channel: channel
          });
        }.bind(this),

        // Entire channels list modified.
        'reset': function( channels ){
          console.log('[ExternalListeners] Request listeners reset.', channels.length );
          this.sendToExternalListeners({
            type: 'source:channel:list',
            source: source.id,
            channels: channels.models || []
          });
        }.bind(this)
      });

      // finally, listen for actual data.
      // Since the nature of the streams inspector is to capture HTTP traffic,
      // but a 'stream' is generic data, we will have to do a bit of translation
      // here from a 'networkevent' to a 'packet' as things mature.
      source.on({
        'add:networkevent': function( event ){
          console.info( 'add:networkevent', event );
          this.sendToExternalListeners({
            type: 'source:packet',
            source: source.id,
            packet: event
          });
        }.bind(this)
      })


      this.sendToExternalListeners({
        type: 'source:added',
        source: source,
        channels: source.requestListeners.length ? source.requestListeners.models : []
      });
    },

    onSourceRemoved: function( source ){
      console.log( '[ExternalListeners] Source disconnected.', source.id );
      this.sendToExternalListeners({
        type: 'source:removed',
        id: source.id
      });
    },

    _sourcesJSON: function(){
      return this.sources.length ? this.sources : [];
    },

    distributeList: function( filter ){
      this.sendToExternalListeners({
        type: 'source:list',
        sources: this._sourcesJSON()
      });
    },

    _waitForExternalListeners: function(){
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
          console.log( '[ExternalListeners] Removing port on disconnect.' );
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

        case "browsertab:register":
          console.log( '[ExternalListeners] Registration request.', port.name  );

          // _.each( this.chromeConnections.models, function(chromeConnection){
          //   if( chromeConnection.sendToPanel ){
          //     console.log( '[ExternalListeners] Sending register request to', chromeConnection.id );
          //     chromeConnection.sendToPanel(message);
          //   }
          // });
          port.postMessage({
            type: 'browsertab:register:success',
            name: 'streams-inspector'
          });
        break;

        case 'source:list':
          port.postMessage({
            type: 'source:list',
            sources: this._sourcesJSON()
          });
        break;

        default:
          console.warn('[ExternalListeners] Unknown external message type:', message.type);
      }
    },

    sendToExternalListeners: function( event ){
      _.each( this.models, function( externalListener ){
        var
        port;
        if( (port = externalListener.get("port")) && port.postMessage ){
          console.log( 'posting external stream event to listener:', externalListener.get('port').name );
          port.postMessage(event);
        }else{
          console.log( 'could not post external event to listener' );
        }
      })
    }
  });
});