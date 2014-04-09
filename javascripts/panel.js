
require(["config"], function() {
require(["app", 
    "BaseListener", 
    "XMPPStreamView"], function(app, BaseListener, XMPPStreamView) {
    console.log("init", app);    

    var stream = new XMPPStreamView();
    console.log("stream:", stream);

  });
});