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
        pattern += "\/*" + path + "*";
      }

      return pattern;

    },

    initialize: function(){
      this.listenToRequestFinished();
      this.set("id", Utils.guidGen());
      this.on("change", function(val){
        console.log("[PGD] responseListener change", this);
      });
    },
    
    // Description: Listen to finished network requests
    // todo: clean up listeners in devtools on close that are not in the background?
    // !!!: Losing content when going from external debug window to nested
    listenToRequestFinished: function(){

      chrome.devtools.network.onRequestFinished.addListener(function(packet){
        try{
          console.info( "WRPattern Response", this.generateNetworkRequestPattern() );
          var urlPattern = new RegExp( this.generateNetworkRequestPattern(), "ig");
          if( urlPattern.test( packet.request.url ) ){
            packet.getContent( function(contents){
              var guid = Utils.guidGen();
              this.trigger("request:finished", {id: guid, streamId: this.get("id"), type:'requestFinished', data: packet, body: contents} );
            }.bind(this));
          }
        }catch( e ){
          console.error( e.stack, true );
        }
      }.bind(this));
    },

  });
});
