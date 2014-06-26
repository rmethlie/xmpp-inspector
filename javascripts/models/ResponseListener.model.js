define(['BaseModel', 'NetworkEvents', 'lib/utils'], function(BaseModel, NetworkEvents, Utils) {
  "use strict";

  // Description: Listen for webRequests in the background and send message to dev tools extension
  var
  backgroundConnectionName  = null,
  tabId                     = null,
  Bridge                    = null,
  networkEvents             = null,

  _webRequestManifest = function(){
    console.info( "WRFilter", _generateWebRequestFilter() )
    return {
      scheme  : Bridge.get("scheme"),
      host    : Bridge.get("host"),
      path    : Bridge.get("path"),
      types   : ["xmlhttprequest"],
      tabId   : tabId,
      name    : backgroundConnectionName
    };
  }, 

  _generateWebRequestFilter = function(){
    //["*://*/*http-bind*"]
    return [ Bridge.get("scheme") + "://" + Bridge.get("host") +  "/*" + Bridge.get("path") + "*" ];
  },

  _generateWebRequestPattern = function(){

    var 
    host    = Bridge.get("host"),
    scheme  = Bridge.get("scheme"),
    path    = Bridge.get("path"),
    pattern = null;

    // do the work...

    scheme = scheme.replace(/\*+/g, ".*");

    if((host = host.replace(/\*+/g, ".*")).length === 0){
      host = ".*";
    }

    path = path.replace(/\*+/g, ".*").replace(/\//g, "\/");
    
    pattern = scheme + ":\/\/" + host;
    if(path.length){
      pattern += "\/*" + path + "*";
    }

    return pattern;

  },
  
  _addListeners = function(){
    console.log("[Stream] addListeners");

    Bridge.sendToBackground({ 
      event: "add:listener", 
      data: _webRequestManifest() 
    });

    // Description: Handle the message sent from the background page
    Bridge.on("stream:update", function(data){
      _handleBeforeRequest(data);
    });

    Bridge.on("tab:updated:complete", function(data){
      _handleTabUpdated(data);
    });

    _listenToRequestFinished();

  },
  
  // Description: Listen to finished network requests
  // todo: clean up listeners in devtools on close that are not in the background?
  // todo: review background.js for possible memory leaks
  // !!!: Losing content when going from external debug window to nested
  _listenToRequestFinished = function(){

    chrome.devtools.network.onRequestFinished.addListener(function(packet){
      try{
        console.info( "WRPattern", _generateWebRequestPattern() );
        var urlPattern = new RegExp( _generateWebRequestPattern(), "ig");
        if( urlPattern.test( packet.request.url ) ){
          console.info( "[ResponseListener] Matched: ", packet.request.url );
          packet.getContent( function(contents){
            var guid = Utils.guidGen();
            networkEvents.add({id: guid, type:'requestFinished', data: packet, body: contents});
            console.info( "[ResponseListener] Request Finished.", contents);
            Bridge.trigger("request:finished", {id: guid, body: contents} );
          }.bind(this));
        }else{
          //console.info( "failed", packet.request.url );
        }
      }catch( e ){
        console.error( e.stack, true );
      }
    }.bind(this));
  },

  // todo: store the network requests and their states as objects on this stream
  //  for now just append the content to get this party started
  _handleBeforeRequest =  function(data){
    console.info( "[Res] Before Request" );
    var guid = Utils.guidGen();
    networkEvents.add({id: guid, type:'beforeRequest', data: data, body: data.requestBody});
    Bridge.trigger("request:sent", {id: guid, body: data.requestBody} );
  },

  _handleTabUpdated = function(data) {
    Bridge.trigger("tab:updated");
  };

  return BaseModel.extend({

    initialize: function( defaults, options ){
      networkEvents = new NetworkEvents()
      Bridge = options.Bridge;
      _addListeners();
    }
  })
});
