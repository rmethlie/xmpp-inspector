

// background.js
chrome.runtime.onConnect.addListener(function (port) {

    var 

    parse = function( message ){
        return ( typeof message === "object" ) ? JSON.parse(message, null, 2) : message;
    },

    extensionListener = function (message, sender, sendResponse) {

        if( message.log ){
            console.log( "[XMPP-INSPECTOR]", parse( message.log ) );
        }else if( message.error ){
            console.error( "[XMPP-INSPECTOR]", parse( message.error ) );
        }
    };

    var _this = this;
      chrome.webRequest.onBeforeRequest.addListener(
        function(info) {
          console.log("Request Intercepted: " + info.requestBody);
          port.postMessage(info);
        },
        // filters
        {
          urls: [
            _this.get("urlPattern")
          ],
          types: ["xmlhttprequest"]
        },
        ['requestBody']);
    // Listen to messages sent from the DevTools page
    port.onMessage.addListener(extensionListener);
    port.onDisconnect.addListener(function(port) {
        port.onMessage.removeListener(extensionListener);
    });
});