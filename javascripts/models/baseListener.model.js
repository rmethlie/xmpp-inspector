define(['BaseModel'], function(BaseModel) {
  "use strict";

  return BaseModel.extend({
    defaults:{
      urlPattern: "*://*/*"
    },

    initialize: function(){
      console.log("[BaseListener] initialize");
    },

    listen: function(){
      var _this = this;
      chrome.webRequest.onBeforeRequest.addListener(
        function(info) {
          console.log("Cat intercepted: " + info.url);
          // Redirect the lolcal request to a random loldog URL.
          // var i = Math.round(Math.random() * loldogs.length);
          // return {redirectUrl: loldogs[i]};
        },
        // filters
        {
          urls: [
            _this.get("urlPattern")
          ],
          types: ["xmlhttprequest"]
        });
      // chrome.devtools.network.onRequestFinished.addListener(function(packet){
      //   try{
          
      //     if( urlPattern.test( packet.request.url ) ){
      //       packet.getContent( function(contents){
      //         try{
      //           console.log("request:finished", packet, contents);
      //           _this.trigger("request:finished", packet, contents);
      //         }catch( eee ){
      //           console.error( eee.stack, true );
      //         }
      //       });
      //     }
      //   }catch( ee ){
      //     console.error( ee.stack, true );
      //   }
      // });
    }

  });
});
