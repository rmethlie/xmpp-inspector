define(['backbone', 'RequestListener', 'lib/utils'], function(Backbone, RequestListener, Utils) {
  "use strict";


  return Backbone.Collection.extend({
    
    model: RequestListener,

    initialize: function(){
      console.log("[RequestListeners] initialize");
      this.addListeners();

      this.on("add", function(listener){
        console.log("added a TAB listener", this.models);
      });
      this.on("remove", function(listener){
        console.log("removed a TAB listener", this.models);
      });
    },

    addListeners: function(){

      // todo: trigger removeListener when the tab/window is closed
      this.on("disconnect", function(panel){
        this._handleDisconnect(panel);
      });
      
      // listen for panel connections
      chrome.runtime.onConnect.addListener(function(port) {
      
        console.log("[RequestListeners] Recvd 'onConnect' event.", port );  
        this.add(new RequestListener().setPort(port));

      }.bind(this));

      // this.on("add",    this._handleConnect.bind(this) );
      // this.on("remove", this._handleDisconnect.bind(this));
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
        this.trigger("disconnect", responseListenerId);
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
