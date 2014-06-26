
require(["config"], function() {
  require(['RequestListeners','StreamShare'], function(RequestListeners,StreamShare) {

    var 
    requestListeners = new RequestListeners(),
    
    streamShareConnection = new StreamShare();
    streamShareConnection.connect().done(function(){
      console.info( "[StreamShare.Connection] Connected.");
    }).fail(function(error){
      console.info( "[StreamShare.Connection] Failed.", error);
    }).progress(function(message){
      console.info( "[Inspector.View]", message);
    })

  });
});
