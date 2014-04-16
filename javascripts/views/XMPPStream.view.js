define(["StreamView"], function(StreamView) {
  "use strict";

  return StreamView.extend({
    
    el: "#xmpp-stream",

    requestSentPrefix: "\n\n<!-- >>>>>>>>>>>>>> Request Sent -->\n",

    responseReceivedPrefix: "\n\n<!-- Response Received <<<<<<<<<<<<<< -->\n",

  });
});
