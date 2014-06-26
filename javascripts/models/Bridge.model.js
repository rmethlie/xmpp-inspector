define(['BaseModel', 'lib/utils'], function( BaseModel, Utils ){


  var
  _trigger = null,
  _connection = null,
  _panels = {},

  // PANEL uses these
  _sendToBackground = function( data ){
    if( _connection && _connection.postMessage ){
      try{
        _connection.postMessage(data);
      }catch( e ){
        console.error(e.stack);
        debugger;
      }
    }
  },

  _handleBackgroundEvent = function(event){
    console.info( "[Bridge] Background Event", event );

    if( event.event ){
      // event
      // e.g, ("some-event", { some: object })
      this.trigger( event.event, event.data );
    }else{
      // sync
      // trigger background sync
      this.set(event.data);
    }
  },


  // and...
  // BACKGROUND uses these
  _sendToPanel = function( panel, message ){
    if( panel.postMessage ){
      panel.postMessage(message);
    }else{
      console.error("could not send message to response listener" );
    }
  },


  _handlePanelEvent = function(event,data) {
    console.log("[Bridge] Panel Event", event );
    _trigger( event, data );
  };

  return BaseModel.extend({

    _connection: null,

    defaults: {
      scheme: "http", 
      host: "*", 
      path: "http-bind"
    },


    initialize: function(attrs,config){

      console.info("[XMPP-Bridge] Init", config);
      _trigger = this.trigger;
      switch( config.env ){

        case 'background':

          // init the connection
          
        break;


        case 'panel':
          var 
          backgroundConnectionName = "port:" + chrome.devtools.inspectedWindow.tabId;
          
          _connection = chrome.runtime.connect({
            name: "port:" + chrome.devtools.inspectedWindow.tabId 
          });

          _connection.onMessage.addListener(_handleBackgroundEvent.bind(this));


          this.on("change",function(data){
            this.sendToBackground( data.changed );
          }.bind(this));

        break;

      }

    },

    handlePanelEvent: _handlePanelEvent,
    // // public
    sendToPanel: _sendToPanel.bind(this),
    sendToBackground: _sendToBackground.bind(this)

  });

});