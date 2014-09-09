define(['backbone', 'ExternalListener', 'underscore', 'lib/utils'], function(Backbone, ExternalListener, _, Utils) {
  "use strict";
  return Backbone.Collection.extend({
    model: ExternalListener,
    initialize: function( listeners, options ){
      console.info( "[ExternalListeners] Initialized.");
      this.requestListeners = options.requestListeners;
      this.requestListeners.on("add", function( requestListener ){
        console.info( "[ExternalListeners] Detected new request listener.");
        requestListener.on("stream:update", this.onStreamEvent.bind(this));
      }.bind(this));
      this.listen();
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

      }.bind(this));
      console.info( "[ExternalListeners] Listening...");
    },

    onStreamEvent: function( event ){
      console.info( "[ExternalListeners] Stream event.", event );
      _.each( this.models, function( externalListener ){
        var
        port = externalListener.get("port");
        if( port.postMessage ){
          port.postMessage(event);
        }
      })
    }
  });
});