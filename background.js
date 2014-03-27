

// background.js
var connections = {};

chrome.runtime.onConnect.addListener(function (port) {

    var extensionListener = function (message, sender, sendResponse) {

        if( message.log ){
            console.log( "[XMPP-INSPECTOR]", JSON.parse( message["log"], null, 2 ) );
        }else if( message.error ){
            console.error( "[XMPP-INSPECTOR]", JSON.parse( message["error"], null, 2 ) );
        }else if ( message.packet ){
        }
    }
    // Listen to messages sent from the DevTools page
    port.onMessage.addListener(extensionListener);
    port.onDisconnect.addListener(function(port) {
        port.onMessage.removeListener(extensionListener);
    });
});