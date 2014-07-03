define(['BaseModel', 'lib/utils', 'backbone'], function( BaseModel, Utils, Backbone ){


  var
  _env = null,
  _connection = null,
  _panels = [],
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

    if( event.event === "__sync__" ){

      // sync data
      Backbone.Model.prototype.set.apply(this,event.data);

    }else{
      // event
      // e.g, ("some-event", { some: object })
      Bridge.trigger( event.event, event.data );
    }
  },


  // and...
  // BACKGROUND uses these
  _sendToPanel = function( Panel, message ){
    try{
      if( Panel.postMessage ){
        Panel.postMessage(message);
      }else{
        console.error("[Bridge] could not send message to response listener" );
      }
    }catch( e ){
      Bridge.trigger("panel:remove", Panel );
      console.error( "[Bridge] Panel disconnected during message send.", Panel.name );
    }
  },

  _handlePanelEvent = function(event) {
    
    if( event.event === "__sync__" ){

      console.log( "[Bridge] Panel set data" );
      // sync data
      Backbone.Model.prototype.set.call(this,event.data);
      
    }else{
      // event
      // e.g, ("some-event", { some: object })
      console.log("[Bridge] Panel Event", event.event, ":", event.data );
      Bridge.trigger( event.event, event.data );
    }
  },

  _bindPanel = function(Panel){
    // bind the panel's onMessage handler to the Bridge listener
    Panel.onMessage.addListener( _handlePanelEvent.bind(Bridge) ); 

    // Give it an id for BB.Collection purposes
    Panel.id = Panel.name;
    
    // add it to the local collection
    _panels[Panel.name] = Panel;
  },

  _releasePanel = function( Panel ){

    // release chrome.runtime listeners
    Panel.onMessage.removeListener( _handlePanelEvent.bind(Bridge) ); 

    // clear the panel from the collection
    delete _panels[Panel.name];
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

      // broadcast to all available panels
      _.each( _panels, function( Panel ){
        _sendToPanel( Panel, { // weird right? using attrs makes sense when you look closer...
          event: event,
          data: data
        });
      });
    }
  },

  _setGlobal = function( event, data ){

    if( typeof event === "object"){
      data = event;
    }

    data = {
      event: "__sync__",
      data: data
    }

    if( _env === 'panel' ){
      _sendToBackground( data );
    }else{

      _.each( _panels, function( Panel ){
        _sendToPanel( Panel, data ); // see above
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
      console.info("[Bridge] Init", config);
      _env = config.env;
      switch( _env ){

        case 'background':
        break;

        case 'panel':

          _bindBackground();

        break;

      }

    },

    set: function(){
      Backbone.Model.prototype.set.apply(this,arguments);
      _setGlobal( arguments );
    },

    // public stuff
    sendToPanel       : _sendToPanel,
    sendToBackground  : _sendToBackground,
    bindPanel         : _bindPanel,
    releasePanel      : _releasePanel,
    bindBackground    : _bindBackground,
    releaseBackground : _releaseBackground,
    triggerGlobal     : _triggerGlobal

  });

});