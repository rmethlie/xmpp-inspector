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
  _paused           = false,
  _trigger          = null,


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

    console.info( "[RequestListener] Before Request." );
  },

  _onCompleted = function(info) {    

    Bridge.triggerGlobal( Panel, {
      event: "stream:update", 
      data: {
        state:"completed",
        info: info
      }
    });

    _trigger( "stream:update:complete", info );

    console.info( "[RequestListener] Completed.", info );
  },

  _addListeners = function(){
    console.log("[RequestListener] Adding Listeners.");
    _listenToBeforeRequest();
    _listenToCompleted();

    // init comm channels
    Bridge.bindPanel( Panel );
  },

  _removeListeners = function(){
    var handler;
    console.log("[RequestListener] Removing Listeners.");
    for(handler in handlers){
      chrome.webRequest[handler].removeListener(handlers[handler]);
      delete handlers[handler];
    }

    // clear comm channels
    Bridge.releasePanel( Panel );
  },

  _listenToBeforeRequest = function(){
    // Get the request body
    handlers["onBeforeRequest"] = _onBeforeRequest.bind(this);

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
    handlers["onCompleted"] = _onCompleted.bind(this);

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
  },

  _pause = function(){

  };

  return BaseModel.extend({

    initialize: function( attrs, options ){

      console.info( "[RequestListener] Create.");

      // create "globals"
      Bridge = options.Bridge;
      Panel = options.Panel;
      this.id = id = Panel.name;
      this.set("pid", id);
      _trigger = this.trigger;

        // listen for this-specific changes
      Bridge.on({

        // Attribute changes

        // URL schema
        "change:host change:scheme change:path": function(){
          _removeListeners();
          _addListeners();
        },

        // Eventss

        // command to copy current text
        "copy:text": function( data ){
          Utils.copyText(data);
        }
      });

      _addListeners();
    },

    pause: _pause,
    getPanel: function(){
      return Panel;
    },
    removeListeners: _removeListeners
  });

});
