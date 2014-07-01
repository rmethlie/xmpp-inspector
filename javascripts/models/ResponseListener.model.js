define(['BaseModel', 'NetworkEvents', 'NetworkEvent', 'lib/utils'], function(BaseModel, NetworkEvents, NetworkEvent, Utils) {
  "use strict";

  // Description: Listen for webRequests in the background and send message to dev tools extension
  var
  backgroundConnectionName  = null,
  tabId                     = null,
  Bridge                    = null,
  networkEvents             = null,

  _webRequestManifest = function(){
    console.log( "[ResponseListener] Building URL Schema.", _generateWebRequestFilter() );
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
    console.log("[ResponseListener] Adding Listeners.");

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
      
      console.groupCollapsed("[ResponseListener] Testing URL.", packet.request.url );
      try{
        console.log( "URL Schema:", _generateWebRequestPattern() );
        var urlPattern = new RegExp( _generateWebRequestPattern(), "ig");
        if( urlPattern.test( packet.request.url ) ){
          packet.getContent( function(contents){
            var 
            guid = Utils.guidGen(),
            netEvent = new NetworkEvent({
              id: guid, 
              type:'requestFinished', 
              data: packet, 
              body: contents
            });

            networkEvents.add(netEvent);

            // trigger on both sides of the bridge.
            Bridge.triggerGlobal("request:finished", netEvent.attributes);
            
            console.log( "Matched. Logging", netEvent.getXMPPStanzaType() );
          }.bind(this));
        }else{
          console.log( "No Match. Skipping." );
        }
      }catch( e ){
        console.error( e.stack, true );
      }
      console.groupEnd();
    }.bind(this));
  },

  // todo: store the network requests and their states as objects on this stream
  //  for now just append the content to get this party started
  _handleBeforeRequest =  function(data){
    console.log( "[ResponseListener] Before Request" );
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
