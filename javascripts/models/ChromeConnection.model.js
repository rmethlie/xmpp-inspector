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
          this.onMessage( message.event, message.data );
        }
      }.bind(this)); 

      this.id = port["name"];
    },


    onMessage: function(event,data) {
      console.log("[ChromeConnection] onMessage", event, ":",data );

      switch(event){
        case "add:listener":
          console.log("add:listener", data );
          this.requestListeners.add( new RequestListener(data)); // manifest
          break;

        case "change:protocol":
          this.requestListeners.findWhere({id: data.id}).set(data);
          break;
        
        case "copy:text":
          console.log("copy:text");
          Utils.copyText(data);
          break;
      }
    },

    addListeners: function(){
      this.listenTo(this.requestListeners, "request:before", function(payload){
        this.sendToPanel(payload);
      });
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
