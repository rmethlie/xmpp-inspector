define(['BaseCollection', 'ChromeConnection', 'RequestListener', 'lib/utils'], function(BaseCollection, ChromeConnection, RequestListener, Utils) {
  "use strict";


  return BaseCollection.extend({
    
    model: ChromeConnection,

    initialize: function(){
      this.addListeners();
      window.RLC = this;
      console.log("[ChromeConnections] Initialized.");
    },

    addListeners: function(){      
      // listen for panel connections
      chrome.runtime.onConnect.addListener(function(port) {
        console.log("[ChromeConnections] Recvd 'onConnect' event");  
        if( !this.findWhere({id: port.name}) ) {
          port.onDisconnect.addListener(function( port ){
            var
            chromeConnection = this.remove(port.name);
            if( chromeConnection ){
              chromeConnection.cleanup();
              console.log( '[ChromeConnections] Removed disconnected chrome connection.', chromeConnection.id );
            }else{
              console.warn( '[ChromeConnections] Could not find chrome connection to remove.', port.name );
            }
          }.bind(this));
          
          port = this.add({id: port.name, port: port},{silent:true});
          // because the name does not change, there is no new event if the
          // same port connects twice.  therefore, components awaiting the
          // add event will not re-init port.
          this.trigger('add',port);
        }
      }.bind(this));

      // when the tab has completed its connection workflow, do
      chrome.tabs.onUpdated.addListener(function(responseListenerId, changeInfo) {
        var responseListener = null;
        if (changeInfo.status === 'complete') {
          if( responseListener = this.get(responseListenerId) ){
            responseListener.sendMessageToResponseListener({
              event: "state:update",
              data: "tab:update:complete"
            });
          }
        }
      }.bind(this));

      chrome.tabs.onRemoved.addListener(function(responseListenerId, isWindowClosing) {
        console.log("TAB closing", responseListenerId, "TODO: removelisteners and port");
        // !!!: remove all the listeners from that tab
        var params = {id: "port:" + responseListenerId};
        var connection = this.findWhere(params);
        if(connection){
          connection.removeWebRequestListeners();
          this.remove(params);
        }
      }.bind(this));

    },

    _handleConnect: function( chromeConnection ){
      console.info("connect", chromeConnection );
    },

    _handleDisconnect: function( chromeConnection ){
      console.info("panel disconnect", chromeConnection );
      if( typeof chromeConnection === "undefined" || chromeConnection === null ){
        console.error( "No chromeConnection found to call removeListeners().");
        return;
      }
    }


  });
});
