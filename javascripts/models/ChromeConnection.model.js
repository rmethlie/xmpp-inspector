define(['BaseModel', 'BaseCollection', 'RequestListener'], function(BaseModel, BaseCollection, RequestListener) {
  "use strict";

  // Description: A Packet instance represents the state of a request when at 
  //  givent point (event name) in the request lifecycle
  return BaseModel.extend({
    
    WRListeners: new BaseCollection(),

    initialize: function(options){
      console.log("[ChromeConnection] initialize");
      this.setPort(options.port);
    },

    setPort: function( port ){
      // handle messages
      port.onMessage.addListener( function( message ){
        console.info( "RAW MEssage", message );
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
      console.log("[RequestListener] onMessage", event, ":",data );

      switch(event){
        case "add:listener":
          console.log("add:listener", data );
          this.WRListeners.add(data); // manifest
          break;

        case "change:protocol":
          this.WRListeners.findWhere({id: data.id}).set(data);
          break;
        
        case "copy:text":
          console.log("copy:text");
          Utils.copyText(data);
          break;
      }
    }
  
  });
});
