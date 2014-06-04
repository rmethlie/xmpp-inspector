define(['backbone', 'RequestListener', 'lib/utils'], function(Backbone, RequestListener, Utils) {
  "use strict";


  return Backbone.Collection.extend({
    
    model: RequestListener,

    initialize: function(){
      console.log("[RequestListeners] initialize");
      this.addListeners();
    },

    addListeners: function(){

      // listen for panel connections
      chrome.runtime.onConnect.addListener(function(port) {
      
        console.log("[RequestListeners] Recvd 'onConnect' event.", port );  
        this.add(new RequestListener().setPort(port));

        // todo: trigger removeListener when the inspector is closed
        //  also try tab/window is closed
      }.bind(this));

      // this.on("add",    this._handleConnect.bind(this) );
      // this.on("remove", this._handleDisconnect.bind(this));
      // when the tab has completed its connection workflow, do
      chrome.tabs.onUpdated.addListener(function(responseListenerId, changeInfo) {
        var
        responseListener = null;
        if (changeInfo.status === 'complete') {
          if( responseListener = this.get(responseListenerId) ){
            responseListener.sendMessageToResponseListener({
              event: "state:update",
              data: "tab:update:complete"
            });
          }
        }
      }.bind(this));

    },

    _handleConnect: function( panel ){
      // console.info("panel connect", arguments );
    },

    _handleDisconnect: function( panel ){
      // console.info("panel disconnect", arguments );
    }


  });
});
