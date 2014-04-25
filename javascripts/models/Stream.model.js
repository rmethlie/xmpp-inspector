define(['BaseModel', 'NetworkEvents', 'Filters', 'lib/utils'], function(BaseModel, NetworkEvents, Filters, Utils) {
  "use strict";

  // Description: Listen for webRequests in the background and send message to dev tools extension
  return BaseModel.extend({

    connection: false,
    
    networkEvents: new NetworkEvents(),
    
    filters: new Filters(),

    defaults :{
      networkRequestPattern: "",
      webRequestURLFilter: [],
      tabId: chrome.devtools.inspectedWindow.tabId,
      backgroundConnectionName: "port:" + chrome.devtools.inspectedWindow.tabId,
    },

    initialize: function(options){
      console.log("[Stream] initialize");
      if(!options)
        options = {};
      
      if(options.filter)
        this.setPattern(options.filter);
      this.addListeners();
    },
    
    addListeners: function(){
      console.log("[Stream] addListeners");
      var _this = this;

      // Description: Handle the message sent from the background page
      this.on("beforeRequest", function(data){
        this.handleBeforeRequest(data);
      });

      this.on("tab:updated:complete", function(data){
        this.handleTabUpdated(data);
      });

      this.listenToRequestFinished();

    },

    // Description: accept URL parameters for web request listener as descirbed in 
    //  https://developer.chrome.com/extensions/match_patterns 
    //  and generate a pattern testable as regex for network request event
    setPattern: function(params){
      this.set("webRequestURLFilter", this._setWebRequestFilter(params));
      this.set("networkRequestPattern", this._setNetworkRequestPattern(params));
    },

    _setWebRequestFilter: function(params){
      return [ params.scheme + "://" + params.host +  "/" + params.path ];
    },

    _setNetworkRequestPattern: function(params){

      var scheme = params.scheme.replace(/\*+/g, ".*");
      
      var host = params.host.replace(/\*+/g, ".*");
      if(host.length === 0)
        host = ".*";

      var path = params.path.replace(/\*+/g, ".*").replace(/\//g, "\/");
      
      var pattern = scheme + ":\/\/" + host;
      if(path.length > 0)
        pattern += "\/" + path;

      return pattern;

    },
    
    // Description: Listen to finished netowrk requests
    // todo: clean up listeners in devtools on close that are not in the background?
    // todo: review background.js for possible memory leaks
    // todo: clear console on refresh events and navigation?
    // !!!: Losing content when going from external debug window to nested
    listenToRequestFinished: function(){
      var _this = this;

      chrome.devtools.network.onRequestFinished.addListener(function(packet){
        try{
          var urlPattern = new RegExp( _this.get("networkRequestPattern"), "ig");
          if( urlPattern.test( packet.request.url ) ){
            packet.getContent( function(contents){
              var guid = Utils.guidGen();
              _this.networkEvents.add({id: guid, type:'requestFinished', data: packet, body: contents});
              _this.trigger("request:finished", {id: guid, body: contents} );
            });
          }
        }catch( e ){
          console.error( e.stack, true );
        }
      });
    },

    connect: function(){
      var _this = this;
      var requestManifest = this.webRequestManifest();
      this.connection = chrome.runtime.connect({name: requestManifest.name });
      this.connection.postMessage({action: "add:listener", manifest: requestManifest});
      this.connection.onMessage.addListener(function(msg) {
        _this.trigger(msg.state, msg);
      });

    },

    // todo: store the network requests and their states as objects on this stream
    //  for now just append the content to get this party started
    handleBeforeRequest: function(data){
      var guid = Utils.guidGen();
      this.networkEvents.add({id: guid, type:'beforeRequest', data: data, body: data.requestBody});
      this.trigger("request:sent", {id: guid, body: data.requestBody} );
    },

    handleTabUpdated: function(data) {
      this.trigger("tab:updated");
    },

    webRequestManifest: function(){
      return {
        urls  : this.get("webRequestURLFilter"),
        types : ["xmlhttprequest"],
        tabId : this.get("tabId"),
        name  : this.get("backgroundConnectionName")
      };
    },

    updateFilter: function(pattern){
      console.log("updateFilter", pattern);
      this.setPattern(pattern);
      this.connection.postMessage({action: "filter:update", pattern: pattern});
    },

  });
});
