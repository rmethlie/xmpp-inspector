require.config({
  paths: {
    underscore: "/javascripts/bower_components/underscore/underscore",
    jquery: "/javascripts/bower_components/jquery/dist/jquery.min",
    backbone: "/javascripts/bower_components/backbone/backbone",
    prettyPrint: "/javascripts/google-code-prettify/src/prettify",
    text: "/javascripts/bower_components/requirejs-text/text",
    CodeMirror: "/javascripts/bower_components/codemirror/lib/codemirror",
    beautifier: "bower_components/js-beautify/js/lib",
    appConfig: "/javascripts/app.config", 
    BaseView: "/javascripts/views/Base.view",
    BaseModel: "/javascripts/models/Base.model",
    BaseListener: "/javascripts/models/BaseListener.model",
    StreamView: "/javascripts/views/Stream.view",
    XMPPStreamView: "/javascripts/views/XMPPStream.view"
  }
});
require(["app", 
    "BaseListener", 
    "XMPPStreamView", 
    "appConfig"], function(app, BaseListener, XMPPStreamView, config) {
    console.log("init", app);
    
    var sniffer = new BaseListener();

    var stream = new XMPPStreamView({listener: sniffer});
    console.log("sniffer:", sniffer);
    console.log("stream:", stream);
    console.log("config settings loaded:", config.isConfig);
    sniffer.listen();

  });
/*
*/