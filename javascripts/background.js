
require(["config"], function() {
  require(['ChromeConnections','ExternalListeners'], function(ChromeConnections,ExternalListeners) {
      var 
      chromeConnections = new ChromeConnections(),
      externalListeners = new ExternalListeners([],{chromeConnections:chromeConnections});
  });
});
