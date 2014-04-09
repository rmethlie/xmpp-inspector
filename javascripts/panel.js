require.config({
  paths: {
    underscore: "/javascripts/bower_components/underscore/underscore",
    jquery: "/javascripts/bower_components/jquery/dist/jquery.min",
    backbone: "/javascripts/bower_components/backbone/backbone",
    text: "/javascripts/bower_components/requirejs-text/text",
    codemirror: "bower_components/codemirror/",
    beautifier: "bower_components/js-beautify/js/lib",
    BaseView: "/javascripts/views/Base.view",
    BaseModel: "/javascripts/models/Base.model",
    BaseListener: "/javascripts/models/BaseListener.model",
    StreamView: "/javascripts/views/Stream.view",
    XMPPStreamView: "/javascripts/views/XMPPStream.view"
  }
});
require(["app", 
    "BaseListener", 
    "XMPPStreamView"], function(app, BaseListener, XMPPStreamView) {
    console.log("init", app);
    

    var stream = new XMPPStreamView();
    console.log("stream:", stream);

  });