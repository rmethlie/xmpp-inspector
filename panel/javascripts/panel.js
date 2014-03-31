
require(["config"], function() {
  require(["jquery", "underscore", "backbone"], function(jquery, underscore, backbone) {
      console.log("init");

  });
});
/*
try{
  var
  httpBind = /http-bind/i,
  emDevToolsBackground = chrome.runtime.connect({
      name: "background"
  });

  function logToPage( message, error, panelBody ){
    
    panelBody.append( "<div class='request'><pre>" + message + "</pre></div>" );  
    
    if( error ){
      emDevToolsBackground.postMessage({
        error: message
      })
    }else{
      emDevToolsBackground.postMessage({
        log: message
      })
    }
  }

    
  chrome.devtools.network.onRequestFinished.addListener(function(packet){
    try{
      var
        body = $(document.body)[0],
        $body = $(body);
      logToPage( packet.request.url, null, $body );
      if( httpBind.test( packet.request.url ) ){

        
        packet.getContent( function(contents){

          try{
            $body.append( "<div>test</div>" );
            contents = $.parseXML(contents);
            $(contents).format({method:'xml'});//.replace( /</g, "&lt;" ).replace( />/g, "&gt;" );
            $body.append( contents.childNodes[0] );
            
          }catch( eee ){
            logToPage( eee.stack, true );
          }
        });
      }
    }catch( ee ){
      logToPage( ee.stack, true );
    }
  });

}catch( e ){
  logToPage( e.stack, true );
}
*/