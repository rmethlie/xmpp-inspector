
require(["config"], function() {
  require(['ChromeConnections','ExternalListeners', 'StreamShare'], function(ChromeConnections,ExternalListeners,StreamShare) {
      var 
      chromeConnections = new ChromeConnections(),
      // pass in connections as 'sources' for external listeners
      externalListeners = new ExternalListeners([],{connections:chromeConnections});
      StreamShare.connect()
        .done( function(){

          // listen for changes and map connections to sources
          chromeConnections.on({
            add     : StreamShare.sources.add,
            remove  : StreamShare.sources.remove,
            reset   : StreamShare.sources.reset
          }, StreamShare.sources );

          // initial sync of collections
          chromeConnections.each( StreamShare.sources.add.bind( StreamShare.source ) );

          console.log( '[StreamShare] Connected to API via WebSocket.' , chromeConnections );
        })
        .fail( function( error ){
          console.warn('[StreamShare] Could not connect to API.', error );
        })
  });
});
