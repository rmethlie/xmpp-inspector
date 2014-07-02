define(["StreamView"], function(ResponseListenerView) {
  "use strict";

  return ResponseListenerView.extend({
    
    el                      : "#xmpp-stream",
    requestSentPrefix       : function(){ return "<!-- " + new Date().toTimeString() + " request sent >>>>>>>>>>>> -->";},
    responseReceivedPrefix  : function(){ return "<!-- <<<<<<<<<<<< " + new Date().toTimeString() + " response received -->";}
  });
});
