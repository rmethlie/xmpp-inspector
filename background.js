// todo: encapsulate listeners to be dynamically created by a devtools message. 
//  This way we are not listening for anything the user is not looking for and the url patter can be dynamic

console.log("background.js loaded");

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
});

// Get the request body
chrome.webRequest.onBeforeRequest.addListener(
    function(info) {
      // requestBody only available when PUT or POST
      // we should check for HTTP method used when determining payload to send back to devtools page
      if(info.requestBody){
        console.log("Request Intercepted w/ body ");
        payload = ab2str(info.requestBody.raw[0].bytes);
        console.log("payload:", payload);
      }
      
    },
    // filters
    {
      urls: ["http://green.eikonmessenger/nhttp-bind/"],
      types: ["xmlhttprequest"]
    },
    ["requestBody"]
);

// get request headers (after everyone has had a chance to change them)
chrome.webRequest.onSendHeaders.addListener(
    function(info) {

    },
    // filters
    {
      urls: ["http://green.eikonmessenger/nhttp-bind/"],
      types: ["xmlhttprequest"]
    }, 
    ["requestHeaders"]
);

// get response headers, http status & response
// chrome.webRequest.onResponseStarted.addListener(
//     function(info) {

//     },
//     // filters
//     {
//       urls: ["http://green.eikonmessenger/nhttp-bind/"],
//       types: ["xmlhttprequest"]
//     },
//     ["HttpHeaders"]
// );

// get response headers, http status & response
chrome.webRequest.onCompleted.addListener(
    function(info) {

    },
    // filters
    {
      urls: ["http://green.eikonmessenger/nhttp-bind/"],
      types: ["xmlhttprequest"]
    },
    ["responseHeaders"]
);

// borrowed from http://updates.html5rocks.com/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
// for a more robust library we can always use https://github.com/inexorabletash/text-encoding
function ab2str(buf) {
    // !!! using Uint8Array because we are assuming utf 8 encoded
    // we should attempt to detect this if possible and accomodate other encodings using the library mentioned above
   // return String.fromCharCode.apply(null, new Uint16Array(buf));
   return String.fromCharCode.apply(null, new Uint8Array(buf));
 }

function str2ab(str) {
   var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char !!!UTF-16!!!
   var bufView = new Uint16Array(buf); 
   for (var i=0, strLen=str.length; i<strLen; i++) {
     bufView[i] = str.charCodeAt(i);
   }
   return buf;
 }