define(["StreamView"], function(StreamView) {
  "use strict";

  return StreamView.extend({
    
    el: "#xmpp-stream",

    initialize: function(options){
      console.log("[XMPPStreamView] initialize");
      this.listenTo(options.listener, "request:finished", function(packet, contents){
        this.append(contents);
      });
    },

    start: function(){

    }

  });
});
