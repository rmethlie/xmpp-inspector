
require(["config"], function() {
require(["app",
    "Stream",
    "XMPPStreamView"], function(app, Stream, XMPPStreamView) {
      // todo: clean up listeners on tab refresh and close

    var xmppStream = new Stream();
    var toolbar = new XMPPStreamToolbarView();
    var stream = new XMPPStreamView({
        model: xmppStream,
        toolbar: toolbar.model
    });

    console.log("stream:", stream);

  });
});

var
reload = function(){
    document.location.reload();
}
