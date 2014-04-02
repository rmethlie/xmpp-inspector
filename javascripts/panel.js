
require(["config"], function() {
  require(["app", "BaseListener", "appConfig", "prettyPrint"], function(app, BaseListener, config, prettyPrint) {
    console.log("init", app);
    
    var listener = new BaseListener();
    console.log("listener:", listener);
    console.log("config settings loaded:", config.isConfig);
    console.log(prettyPrintOne("var x='two';"));
    try{
      var
      httpBind = /http-bind/i,
      emDevToolsBackground = chrome.runtime.connect({
          name: "background"
      });

      function logToPage( message, error, panelBody ){
        
        $(panelBody).append( "<div class='request'><pre>" + message + "</pre></div>" );  
        
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
            body = $("#xmpp-inspector-panel")[0],
            $body = $(body);

          
          if( httpBind.test( packet.request.url ) ){
            logToPage( packet.request.url, null, $body );

            packet.getContent( function(contents){

              try{
                $body.append( "<div><textarea>" + contents + "</textarea></div>" );
                // contents = $.parseXML(contents);
                // $(contents).format({method:'xml'});//.replace( /</g, "&lt;" ).replace( />/g, "&gt;" );
                // $body.append( contents.childNodes[0] );
                
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

  });
});
/*
*/