
require(["config"], function() {
require(["app",
    "Stream",
    "XMPPStreamView"], function(app, Stream, XMPPStreamView) {
      // todo: clean up listeners on tab refresh and close
    console.log("init", app);    
    var xmppStream = new Stream();
    var stream = new XMPPStreamView({model: xmppStream});
    console.log("stream:", stream);

  });
});