try{
  var
  httpBind = /http-bind/i,
  emDevToolsBackground = chrome.runtime.connect({
      name: "background"
  }),
  $body = $(document.body);

  function logToPage( message, error ){
    $body.append( "<div class='request'><pre>" + message + "</pre></div>" );  
    if( error ){
      emDevToolsBackground.postMessage({
        error: contents
      })
    }
  }

    
  chrome.devtools.network.onRequestFinished.addListener(function(packet){
    try{
      
      logToPage( packet.request.url );
      if( httpBind.test( packet.request.url ) ){

        logToPage( packet.request.url, true );
        
        // packet.getContent( function(contents){

        //   var contents = $($.parseXML(message.packet));
        //   contents = contents.format({method:'xml'})[0];//.replace( /</g, "&lt;" ).replace( />/g, "&gt;" );
        //   logToPage( contents  );


        // });
      }
    }catch( ee ){
      logToPage( ee.stack, true )
    }
  });

}catch( e ){
  logToPage( e.stack, true );
}