define(['backbone', 'RequestListener', 'lib/utils'], function(Backbone, RequestListener, Utils) {
  "use strict";

  var
  initialized = false,
  Bridge = null,

  _onDisconnect = function(Panel){
    console.log( "[RequestListeners] Panel Disconnected:", Panel.name );
    // remove the request listener (not the panel)
    // from the collection.
    // this will trigger internal removeListeners() 
    // in request listener model
    this.remove(Panel.name);
  };

  return Backbone.Collection.extend({
    
    model: RequestListener,

    initialize: function(defaults,env){
      Bridge = env.Bridge;
      console.info("[RequestListeners] Initialize.");
      this.addListeners();
    },

    addListeners: function(){

      console.info( "[RequestListeners] Adding Listeners.");
      
      // listen for panel connections
      chrome.runtime.onConnect.addListener(function(Panel) {

        console.info( "[RequestListeners] Panel.onConnect:", Panel.name );
        
        // pass in the bridge and chrome panel obj for comm/sync
        // and add it to the collection
        this.add(new RequestListener({}, {
          Bridge: Bridge,
          Panel: Panel
        }));

        // add a disconnect listener (should this be in the RequestListener)
        Panel.onDisconnect.addListener(_onDisconnect.bind(this));

      }.bind(this));

      // add listeners to handle new/deleted ports
      this.on({
        "remove": function( requestListener ){

          // clear out any internal listeners
          requestListener.removeListeners();
          
          // remove the chrome listener for port disconnects
          requestListener.getPanel().onDisconnect.removeListener(_onDisconnect.bind(this));

          // remove any bridge listeners


        },
        "stream:update:complete": function( data ){
          if( _socket ){
            _socket.emit( "streamshare", data );
          }
        }
      });

      // on panel removed (associated web page is destroyed)
      chrome.tabs.onRemoved.addListener(_onDisconnect.bind(this));

      Bridge.on({
        "panel:remove": _onDisconnect.bind(this)
      })

    },

    registerStreamShareSocket: function( socket ){
      console.info( "[RequestListeners] Registered StreamShare Socket: ", socket.id );
      this.streamShareSocket = socket;
    }

  });
});
