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
      
      logToPage( packet.request.url );
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