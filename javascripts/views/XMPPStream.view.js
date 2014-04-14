define(["StreamView"], function(StreamView) {
  "use strict";

  return StreamView.extend({
    
    el: "#xmpp-stream",

    requestSentPrefix: "\n<!-- >>>>>>>>>>>>>> Request Sent -->\n",

    responseReceivedPrefix: "\n<!-- Response Received <<<<<<<<<<<<<< -->\n",

  });
});
