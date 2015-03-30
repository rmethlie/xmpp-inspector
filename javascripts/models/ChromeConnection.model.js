define(['BaseModel', 'BaseCollection', 'RequestListener'], function(BaseModel, BaseCollection, RequestListener) {
  "use strict";

  // Description: A Packet instance represents the state of a request at 
  //  given point (event name) in the request lifecycle
  return BaseModel.extend({
    
    requestListeners: null,

    initialize: function(options){
      console.log("[ChromeConnection] initialize");
      this.requestListeners = new BaseCollection();
      this.setPort(options.port);
      this.addListeners();
    },

    setPort: function( port ){
      // handle messages
      port.onMessage.addListener( function( message ){
        console.info( "RAW Message", message );
        if( typeof message.event === "undefined" ){
          //todo: map the intended attribute update to the listener
          this.set( message );
        }else{
          this.onMessage( message );
        }
      }.bind(this)); 

      this.id = port["name"];
    },

    toJSON: function(){
      return {
        id: this.id,
        channels: this.requestListeners.toJSON()
      }
    },


    onMessage: function(message) {
      console.log("[ChromeConnection] onMessage", message );

      switch(message.event){

        case "add:listener":
          console.log("add:listener", message.data );
          this.requestListeners.add( new RequestListener(message.data)); // manifest
          break;

        case "remove:listener":
          console.log("remove:listener", message.data );
          var listener = this.requestListeners.findWhere({
            scheme: message.data.scheme,
            host  : message.data.host,
            path  : message.data.path
          });

          this.requestListeners.remove(listener);
          break;

        case "change:protocol":
          this.requestListeners.findWhere({id: message.data.id}).set(message.data);
          break;
        
        case "copy:text":
          console.log("copy:text");
          Utils.copyText(message.data);
          break;

        case 'request:finished':
          this.trigger('request:finished', message );
          break;
      }
    },

    addListeners: function(){
      this.listenTo(this.requestListeners, "request:before", function(payload){
        this.sendToPanel(payload);
      });
      this.listenTo(this.requestListeners, 'stream:update', function( payload ){
        this.trigger( 'stream:update', payload );
      })
    },

    sendToPanel: function( message ){
      var port = this.get("port");
      if( port.postMessage ){
        port.postMessage(message);
        console.info( "postmessage", this.attributes, message );
      } else {
        console.error("could not send message to response listener" );
      }
    },

    removeWebRequestListeners: function(){
      this.requestListeners.forEach(function(listener){
        listener.removeListeners();
      });
    }

  
  });
});
