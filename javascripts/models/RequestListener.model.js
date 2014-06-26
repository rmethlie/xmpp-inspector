define(['lib/utils', 'BaseModel'], function(Utils, BaseModel) {
  "use strict";

  // Description: Listen for webRequests in the background and send message to dev tools extension
 
  var
  Bridge            = null,
  Panel             = null,
  types             = ["xmlhttprequest"],
  tabId             = -1,
  streamshare       = false,
  handlers           = {},
  _responseListener = null,
  id                = null,


  _generateWebRequestFilter = function(){
      //["*://*/*http-bind*"]
      return [Bridge.get("scheme")+"://"+Bridge.get("host")+"/*"+Bridge.get("path")+"*"];
  },

  _onBeforeRequest = function(info) {

    var content = "";
    // note: requestBody.raw[0].bytes is an ArrayBuffer type object 
    //  but it becomes a regular object when passed to the devtools extension page.
    //  we can either parse the ArrayBuffer here or serialize it here then deserialize it
    //  in devtools page. see http://stackoverflow.com/questions/8593896/chrome-extension-how-to-pass-arraybuffer-or-blob-from-content-script-to-the-bac
    //  for details.
    if(info.requestBody){
      content = Utils.ArrayBufferToString(info.requestBody.raw[0].bytes);
    }

    Bridge.sendToPanel( Panel, {
      event: "stream:update", 
      data:{
        state:"beforeRequest", 
        info: info,
        requestBody: content
      }
    });
  },

  _onCompleted = function(info) {    

    Bridge.sendToPanel( Panel, {
      event: "stream:update", 
      data: {
        state:"completed",
        info: info
      }
    });
  },

  _addListeners = function(){
    console.log("[StreamListener] addListeners");
    _listenToBeforeRequest();
    _listenToCompleted();
  },

  _removeListeners = function(){
    var handler;
    console.log("[StreamListener] removeListeners");
    for(handler in handlers){
      chrome.webRequest[handler].removeListener(handlers[handler]);
      delete handlers[handler];
    }
  },

  _listenToBeforeRequest = function(){
    // Get the request body
    handlers["onBeforeRequest"] = _onBeforeRequest;

    chrome.webRequest.onBeforeRequest.addListener(
        handlers["onBeforeRequest"],
        // filters
        {
          urls  : _generateWebRequestFilter(),
          types : types,
          tabId : tabId
        },
        ["requestBody"]
    );
  },

  _listenToCompleted = function(){
    // get response headers, http status & response
    // chrome.webRequest.onResponseStarted.addListener()
    handlers["onCompleted"] = _onCompleted;

    chrome.webRequest.onCompleted.addListener(
        handlers["onCompleted"],
        // filters
        {
          urls  : _generateWebRequestFilter(),
          types : types,
          tabId : tabId
        },
        ["responseHeaders"]
    );
  };




  return BaseModel.extend({
    removeListeners : _removeListeners,
    addListeners    : _addListeners,
    initialize: function( attrs, options ){

      console.info( "[RequestListener] Create.");
      Bridge = options.Bridge;
      Panel = options.Panel;
      this.id = id = Panel.name;
      this.set("pid", id);

        // listen for this-specific changes
      Bridge.on({
        "change:host change:scheme change:path": function(){
          _removeListeners();
          _addListeners();
        },

        "add:listener": function( data ){
          console.log("add:listener", data );
          _addListeners();
        },

        "copy:text": function( data ){
          console.log("copy:text");
          Utils.copyText(data);
        }

      });
    }
  });

});
