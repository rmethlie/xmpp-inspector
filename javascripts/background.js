
require(["config"], function() {
  require(['ChromeConnections','ExternalListeners', 'StreamShare'], function(ChromeConnections,ExternalListeners,StreamShare) {
      var 
      chromeConnections = new ChromeConnections(),
      // pass in connections as 'sources' for external listeners
      externalListeners = new ExternalListeners([],{sources:chromeConnections});
      StreamShare.connect()
        .done( function(){
          console.log( '[StreamShare] Connected to API via WebSocket.' );
        })
        .fail( function( error ){
          console.warn('[StreamShare] Could not connect to API.', error );
        })
  });
});
