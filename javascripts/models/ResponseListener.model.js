define(['BaseModel', 'lib/utils'], function(BaseModel, Utils) {
  "use strict";

  // Description: Listen for webRequests in the background and send message to dev tools extension
  return BaseModel.extend({

    defaults : Utils.defaultListenerAttributes,

    generateNetworkRequestPattern: function(){

      var
        host = this.get("host"),
        scheme = this.get("scheme"),
        path = this.get("path"),
        pattern = null;

      scheme = scheme.replace(/\*+/g, ".*");

      if((host = host.replace(/\*+/g, ".*")).length === 0){
        host = ".*";
      }

      path = path.replace(/\*+/g, ".*").replace(/\//g, "\/");
      
      pattern = scheme + ":\/\/" + host;
      if(path.length){
        pattern += "\/" + path;
      }

      return pattern;

    },

    initialize: function(){
      this.set("id", Utils.guidGen());
      this.on("change", function(val){
        console.log("[PGD] responseListener change", this);
      });
      // Create a bound version of this function to preserve 'this' context
      //    when executing on the response for a listener and to reference it 
      //    later when removing it. You can't unbind an anonymous function.
      this.onRequestFinished = this.onRequestFinished.bind(this);
      this.listenToRequestFinished();
    },
    
    // Description: Listen to finished network requests
    // todo: clean up listeners in devtools on close that are not in the background?
    // !!!: Losing content when going from external debug window to nested
    listenToRequestFinished: function(){
      chrome.devtools.network.onRequestFinished.addListener(this.onRequestFinished);
    },

    onRequestFinished: function(packet){
      try{
        console.info( "WRPattern Response", this.generateNetworkRequestPattern() );
        var urlPattern = new RegExp( this.generateNetworkRequestPattern(), "ig");
        if( urlPattern.test( packet.request.url ) ){
          packet.getContent( function(contents){
            var guid = Utils.guidGen();
            this.trigger("request:finished", {
              id        : guid, 
              streamId  : this.get("id"), 
              type      :'requestFinished', 
              data      : packet, 
              body      : contents,
              format    : this.get("format")
            });
          }.bind(this));
        }
      }catch( e ){
        console.error( e.stack, true );
      }
    },

    stopListening: function(){
      console.log("[RespsonseListener] stopListening");
      chrome.devtools.network.onRequestFinished.removeListener(this.onRequestFinished);
    }

  });
});
