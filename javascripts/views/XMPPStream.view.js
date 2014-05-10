define(["StreamView"], function(StreamView) {
  "use strict";

  return StreamView.extend({

    el: "#xmpp-stream",

    requestSentPrefix: function(data) {
      var now = new Date();
      return "<!-- " + now.toTimeString() + " request sent: -->";
    },

    responseReceivedPrefix: function(data) {
      var now = new Date();
      return "<!-- " + now.toTimeString() + " response received: -->";
    },
  });
});
