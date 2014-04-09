

// background.js
chrome.runtime.onConnect.addListener(function (port) {
    console.log("chrome.runtime.onConnect.addListener");

    var _this = this;

    var parse = function( message ){
        return ( typeof message === "object" ) ? JSON.parse(message, null, 2) : message;
    };

    var extensionListener = function (message, sender, sendResponse) {

        if( message.log ){
            console.log( "[XMPP-INSPECTOR]", parse( message.log ) );
        }else if( message.error ){
            console.error( "[XMPP-INSPECTOR]", parse( message.error ) );
        }
    };

    var longpoll = chrome.runtime.connect({name: "XMPPlongpoll"});
    // port.postMessage({joke: "Knock knock"});
    // port.onMessage.addListener(function(msg) {
      
    // });

    // Listen to messages sent from the DevTools page
    // port.onMessage.addListener(extensionListener);
    // port.onDisconnect.addListener(function(port) {
    //     port.onMessage.removeListener(extensionListener);
    // });

    chrome.webRequest.onBeforeRequest.addListener(
        function(info) {
          console.log("Request Intercepted: " + info.requestBody);
          longpoll.postMessage(info);
        },
        // filters
        {
          urls: [
            _this.get("urlPattern")
          ],
          types: ["xmlhttprequest"]
        },
        ['requestBody']
    );

});