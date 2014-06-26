define(['backbone', 'RequestListener', 'lib/utils','Bridge'], function(Backbone, RequestListener, Utils, Bridge) {
  "use strict";

  var
  initialized = false,
  Bridge = new Bridge({
    // no defaults yet...
  },{
    env: 'background'
  });

  return Backbone.Collection.extend({
    
    model: RequestListener,

    initialize: function(){
      console.log("[RequestListeners] initialize");
      this.addListeners();
    },

    addListeners: function(){
      if( initialized ){
        console.info( "second init");
        return;
      }
      initialized = true;

      console.info( "initialized");
      // listen for panel connections
      chrome.runtime.onConnect.addListener(function(Panel) {

        // why?!?
        if( this.get(Panel.name) ){
          console.info( "exists!!!");
        }
        // add a request listener to the collection
        // pass in the bridge for comm/sync
        this.add(new RequestListener({}, {
          Bridge: Bridge,
          Panel: Panel
        }));

        Panel.onMessage.addListener( Bridge.handleBackgroundEvent.bind(Bridge) ); 

        console.info( "Adding panel", this.models);
      }.bind(this));

      // add listeners to handle new/deleted ports
      this.on({
        "add"   : this._handleConnect.bind(this),
        "remove": this._handleDisconnect.bind(this)
      });

      // // when the tab has completed its connection workflow, do
      // chrome.tabs.onUpdated.addListener(function(panelId, changeInfo) {
      //   var panel = null;
      //   if (changeInfo.status === 'complete') {
      //     if( panel = this.get(panelId) ){
      //       Bridge.sendToPanel( panel, {
      //         event: "state:update",
      //         data: "tab:update:complete"
      //       });
      //     }
      //   }
      // }.bind(this));

      // on disconnect
      chrome.tabs.onRemoved.addListener(function(responseListenerId, isWindowClosing) {
        this.remove("port:"+responseListenerId);
      }.bind(this));

    },

    _handleConnect: function( panel ){
      console.info("panel connect", panel );
    },

    _handleDisconnect: function( panel ){
      console.info("panel disconnect", panel );
      if( typeof panel === "undefined" || panel === null ){
        console.error( "No panel found to call removeListeners().");
        return;
      }
      panel.removeListeners();
    }

  });
});
