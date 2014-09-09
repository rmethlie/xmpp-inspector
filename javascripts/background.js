
require(["config"], function() {
  require(['RequestListeners','ExternalListeners'], function(RequestListeners,ExternalListeners) {
      var 
      requestListeners = new RequestListeners(),
      externalListeners = new ExternalListeners([],{requestListeners:requestListeners});
  });
});
