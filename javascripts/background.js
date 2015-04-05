
require(["config"], function() {
  require(['ChromeConnections','ExternalListeners'], function(ChromeConnections,ExternalListeners) {
      var 
      chromeConnections = new ChromeConnections(),
      // pass in connections as 'sources' for external listeners
      externalListeners = new ExternalListeners([],{sources:chromeConnections});
  });
});
