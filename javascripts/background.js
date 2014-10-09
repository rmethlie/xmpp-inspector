
require(["config"], function() {
  require(['ChromeConnections','ExternalListeners'], function(RequestListeners,ExternalListeners) {
      var 
      chromeConnections = new ChromeConnections(),
      externalListeners = new ExternalListeners([],{requestListeners:requestListeners});
  });
});
