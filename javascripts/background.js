
require(["config"], function() {
  require(['ChromeConnections','ExternalListeners', 'ContextMenu'], function(ChromeConnections,ExternalListeners, ContextMenu) {
      var 
      chromeConnections = new ChromeConnections(),
      // pass in connections as 'sources' for external listeners
      contextMenu = new ContextMenu(),
      externalListeners = new ExternalListeners([],{sources:chromeConnections});
  });
});
