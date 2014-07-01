define(['BaseModel', 'lib/utils'], function( BaseModel, Utils ){


  var
  _env = null,
  _connection = null,
  Bridge = null,

  // PANEL uses these
  _sendToBackground = function( data ){
    if( _connection && _connection.postMessage ){
      try{
        _connection.postMessage(data);
      }catch( e ){
        console.error(e.stack);
      }
    }
  },

  _handleBackgroundEvent = function(event){
    console.info( "[Bridge] Background Event", event );

    if( event.event ){
      // event
      // e.g, ("some-event", { some: object })
      Bridge.trigger( event.event, event.data );
    }else{
      // sync
      // trigger background sync
      Bridge.set(event.data);
    }
  },


  // and...
  // BACKGROUND uses these
  _sendToPanel = function( Panel, message ){
    try{
      if( Panel.postMessage ){
        Panel.postMessage(message);
      }else{
        console.error("could not send message to response listener" );
      }
    }catch( e ){
      Bridge.trigger("panel:remove", Panel );
      console.error( "[Bridge] Panel disconnected during message send.", Panel.name );
    }
  },


  _handlePanelEvent = function(event,data) {
    if( event.event ){
      // event
      // e.g, ("some-event", { some: object })
      console.log("[Bridge] Panel Event", event.event, ":", event.data );
      Bridge.trigger( event.event, event.data );
    }else{
      // sync
      // trigger background sync
      Bridge.set(event.data);
    }
  },

  _bindPanel = function(Panel){
    // bind the panel's onMessage handler to the Bridge listener
    Panel.onMessage.addListener( _handlePanelEvent.bind(Bridge) ); 
  },

  _releasePanel = function( Panel ){

    Panel.onMessage.removeListener( _handlePanelEvent.bind(Bridge) ); 
  },

  _bindBackground = function(){

    var 
    backgroundConnectionName = "port:" + chrome.devtools.inspectedWindow.tabId;
    
    _connection = chrome.runtime.connect({
      name: "port:" + chrome.devtools.inspectedWindow.tabId 
    });

    _connection.onMessage.addListener(_handleBackgroundEvent.bind(Bridge));
  },

  _releaseBackground = function(){

    _connection.onMessage.removeListener(_handleBackgroundEvent.bind(Bridge) );

  },

  _triggerGlobal = function( event, data ){

    // trigger local
    Bridge.trigger(event,data);

    // send over the bridge
    if( _env === 'panel' ){
      Bridge.sendToBackground({
        event: event,
        data: data
      });
    }else if( _env === 'background' ){
      Bridge.sendToPanel({
        event: event,
        data: data
      })
    }
  };

  return BaseModel.extend({

    _connection: null,

    defaults: {
      scheme: "http", 
      host: "*", 
      path: "http-bind"
    },


    initialize: function(attrs,config){

      // create a local reference to this
      Bridge = this;

      // 
      console.info("[XMPP-Bridge] Init", config);
      _env = config.env;
      switch( _env ){

        case 'background':

          // init the connection
          // so far, nothing to see here.
          
        break;

        case 'panel':

          _bindBackground();

          Bridge.on("change",function(data){
            this.sendToBackground( data.changed );
          }.bind(Bridge));

        break;

      }

    },

    // public stuff
    sendToPanel       : _sendToPanel,
    sendToBackground  : _sendToBackground,
    bindPanel         : _bindPanel,
    bindBackground    : _bindBackground,
    triggerGlobal     : _triggerGlobal

  });

});