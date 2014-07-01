
require(["config"], function() {
  require(['RequestListeners','StreamShare','Bridge'], function(RequestListeners,StreamShare,Bridge) {

    var 
    // TODO: 
    // master model, message passer, event emitter?
    // too much...break it up.
    Bridge = new Bridge({
        // no defaults yet...
    },{
      env: 'background'
    }),

    // create collection for RequestListener models
    requestListeners = new RequestListeners([],{
      // give the collection a way to communicate
      Bridge: Bridge
    }),
    
    streamShareConnection = new StreamShare();
    streamShareConnection.connect().done( function( socket ){
      
      var streamShareEnabled = false;
      console.info( "[StreamShare.Connection] Connected. ["+socket.nsp+"]");

      Bridge.on({

        "streamshare": function( event ){
          streamShareEnabled = event.enabled === true ? true : false;
          console.log( "[StreamShare.Connection] " + 
            (streamShareEnabled ? "enabling" : "disabling") + "data stream." 
          );
        },

        "request:finished": function( data ){
          if( streamShareEnabled ){
            data = {
              body: data.body
            }
            console.log( "[StreamShare.Connection] Sending StreamShare data.", data );
            socket.emit( "data", data );
          }
        }
      });

    }).fail(function(error){
      console.info( "[StreamShare.Connection] Failed.", error);
    }).progress(function(message){
      console.info( "[Inspector.View]", message);
    })

  });
});
