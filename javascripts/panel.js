
require(["config"], function() {
require(["app",
    "Stream",
    "XMPPStreamView",
    "XMPPStreamToolbarView"], function(app, Stream, XMPPStreamView, XMPPStreamToolbarView) {
      // todo: clean up listeners on tab refresh and close

    var xmppStream = new Stream();
    var toolbar = new XMPPStreamToolbarView();
    var stream = new XMPPStreamView({
        model: xmppStream,
        toolbar: toolbar.model
    });

  });
});

var
reload = function(){
    document.location.reload();
}
