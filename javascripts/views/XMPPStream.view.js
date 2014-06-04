define(["ResponseListenerView"], function(ResponseListenerView) {
  "use strict";

  return ResponseListenerView.extend({
    
    el: "#xmpp-stream",

    requestSentPrefix: "<!-- >>>>>>>>>>>>>> Request Sent -->",

    responseReceivedPrefix: "<!-- Response Received <<<<<<<<<<<<<< -->"

  });
});
