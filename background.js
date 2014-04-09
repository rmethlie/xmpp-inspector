// todo: encapsulate listeners to be dynamically created by a devtools message. 
//  This way we are not listening for anything the user is not looking for and the url patter can be dynamic

require.config({
  paths: {
    underscore: "javascripts/bower_components/underscore/underscore",
    jquery: "javascripts/bower_components/jquery/dist/jquery.min",
    backbone: "javascripts/bower_components/backbone/backbone",
    BaseModel: "javascripts/models/Base.model",
    packet: "javascripts/models/Packet.model",
    BaseListener: "javascripts/models/BaseListener.model"
  }
});
require(['BaseListener'], function(BaseListener) {

    var streamListener = new BaseListener();
    // streamListener.addStream();

    // chrome.runtime.onConnect.addListener(function (port) {
    //     console.log("chrome.runtime.onConnect.addListener");

    //     var _this = this;

    //     var parse = function( message ){
    //         return ( typeof message === "object" ) ? JSON.parse(message, null, 2) : message;
    //     };

    //     var extensionListener = function (message, sender, sendResponse) {

    //         if( message.log ){
    //             console.log( "[XMPP-INSPECTOR]", parse( message.log ) );
    //         }else if( message.error ){
    //             console.error( "[XMPP-INSPECTOR]", parse( message.error ) );
    //         }
    //     };
    // });

  });