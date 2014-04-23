define(["StreamView"], function(StreamView) {
  "use strict";

  return StreamView.extend({
    
    el: "#xmpp-stream",

    requestSentPrefix: "<!-- >>>>>>>>>>>>>> Request Sent -->",

    responseReceivedPrefix: "<!-- Response Received <<<<<<<<<<<<<< -->",

  });
});
