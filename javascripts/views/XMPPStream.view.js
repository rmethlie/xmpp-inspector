define(["StreamView"], function(StreamView) {
  "use strict";

  return StreamView.extend({
    
    el                      : "#xmpp-stream",
    requestSentPrefix       : function(){ return "<!-- " + new Date().toTimeString() + " request sent >>>>>>>>>>>> -->";},
    responseReceivedPrefix  : function(){ return "<!-- <<<<<<<<<<<< " + new Date().toTimeString() + " response received -->";}
  });
});
