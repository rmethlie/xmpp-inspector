define(["ResponseListenerView"], function(ResponseListenerView) {
  "use strict";

  return ResponseListenerView.extend({
    
    el: "#xmpp-stream",
    requestSentPrefix       : "<!-- " + new Date().toTimeString() + " request sent: -->"
    responseReceivedPrefix  : "<!-- " + new Date().toTimeString() + " response received: -->"
  });
});
