
require(["config"], function() {
require(['BaseListener'], function(BaseListener) {
    var BaseListener = require('BaseListener');
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
});