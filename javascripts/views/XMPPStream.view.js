define(["StreamView"], function(StreamView) {
  "use strict";

  return StreamView.extend({
    
    el: "#xmpp-stream",

    listener: null,

    initialize: function(options){
      console.log("[XMPPStreamView] initialize");
      this.listener = options.listener;

      this.listenTo(this.listener, "request:finished", function(packet, contents){
        contents = this.formatMarkUp(contents);
        contents = prettyPrintOne(contents, null, false);
        this.append(contents);
      });
    },

    start: function(){

    }

  });
});
