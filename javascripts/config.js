// This is the runtime configuration file.  It complements the Gruntfile.js by
// supplementing shared properties.
require.config({
  paths: {
    "underscore": "/javascripts/bower_components/underscore/underscore",
    "jquery": "/javascripts/bower_components/jquery/dist/jquery.min",
    "backbone": "/javascripts/bower_components/backbone/backbone",
    "prettyPrint": "/javascripts/google-code-prettify/src/prettify",
    "text": "/javascripts/bower_components/requirejs-text/text",
    "CodeMirror": "/javascripts/bower_components/codemirror/lib/codemirror",
    "appConfig": "/javascripts/app.config", 
    "BaseView": "/javascripts/views/Base.view",
    "BaseModel": "/javascripts/models/Base.model",
    "BaseListener": "/javascripts/models/BaseListener.model",
    "StreamView": "/javascripts/views/Stream.view",
    "XMPPStreamView": "/javascripts/views/XMPPStream.view"
  }
});
// require(['/javascripts/bower_components/codemirror/lib/codemirror',
//            '/javascripts/bower_components/codemirror/mode/xml/xml'], function(CodeMirror){
//         CodeMirror.fromTextArea(document.body, {
//           mode: 'text/html',
//           lineNumbers: true,
//           matchBrackets: true,
//           lineWrapping: true
//         });

// });
