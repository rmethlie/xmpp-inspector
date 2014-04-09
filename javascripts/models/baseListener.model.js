define(['BaseModel'], function(BaseModel) {
  "use strict";

  return BaseModel.extend({
    defaults:{
      url: "http-bind"
    },

    initialize: function(){
      console.log("[BaseListener] initialize");
    },

    listen: function(){
      var _this = this;
      chrome.runtime.onConnect.addListener(function(port) {
        console.assert(port.name == "XMPPlongpoll");
        port.onMessage.addListener(function(msg) {
          console.log("Received a msg from XMPPlongpoll");
        });
      });
      // var urlPattern = new RegExp( this.get("url"), "i");

      // chrome.devtools.network.onRequestFinished.addListener(function(packet){
      //   try{
          
      //     if( urlPattern.test( packet.request.url ) ){
      //       packet.getContent( function(contents){
      //         try{
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
