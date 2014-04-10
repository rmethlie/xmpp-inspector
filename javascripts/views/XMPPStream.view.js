define(["StreamView"], function(StreamView) {
  "use strict";

  return StreamView.extend({
    
    el: "#xmpp-stream",

    requestSentPrefix: "\n<!-- >>>>>>>>>>>>>> Request Sent -->",

    responseReceivedPrefix: "\n<!-- Response Received <<<<<<<<<<<<<< -->",

  });
});
