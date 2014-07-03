define(["BaseView",
  "StreamToolbarModel",
  'text!templates/toolbar.template.html'], function(BaseView, StreamToolbarModel, toolbarTemplate) {
  "use strict";

  var
  Bridge = null;

  return BaseView.extend({

    el: ".toolbar-wrapper",

    streamSharing: false,

    template: _.template(toolbarTemplate),

    events: {
      "click .button.reload"        : "reload",
      "click .button.copy"          : "copy",
      "click .button.clear"         : "clear",
      "click .button.options"       : "options",
      "click .button.show-sub-bar"  : "toggleSubbar",
      "click .url-pattern .label"   : "toggleUrlInput",
      "click .share"                : "toggleStreamShare",
      "click .update-url-pattern  [type='submit']" : "updateUrlPattern"
    },

    initialize: function(){

      // naming convention (needs another look)
      Bridge = this.model;
      
      this.render();
      
      Bridge.on({
        "change:scheme"   : this.render.bind(this),
        "change:host"     : this.render.bind(this),
        "change:path"     : this.render.bind(this)
      });

      console.info( "[TOOLBAR] Initialized.");      
    },

    render: function(){
      this.$el.html(this.template({
        filter: this.scrubPattern(this.model.attributes)
      }));
    },

    reload: function(){
      document.location.reload();
    },

    clear: function(){
      // clear stream list
      Bridge.trigger("toolbar:command", {
        name: "clear",
        data: {}
      });
    },

    copy: function(){
      Bridge.trigger("toolbar:command", {
        name: "copy",
        data: {}
      });
    },

    options: function(e){
      var  $button = this.$el.find(".button.options");
      $button.toggleClass("accordian");
    },

    toggleSubbar: function(){
      this.$el.find(".sub-bar").toggleClass("hidden");
      Bridge.trigger("toolbar:command", {
        name: "toggle-subbar"
      });
    },

    showStreamShareLogin: function(){
      this.$el.find(".sub-bar .streamshare .login").show();
    },

    hideStreamShareLogin: function(){
      this.$el.find(".sub-bar .streamshare .login").hide();
    },

    updateUrlPattern: function(e){
      e.preventDefault();
      e.stopPropagation();
      var urlParams = this.scrubPattern({
        scheme  : this.$el.find("form .scheme").val() || this.model.get("scheme"),
        host    : this.$el.find("form .host").val() || this.model.get("host"),
        path    : this.$el.find("form .path").val() || this.model.get("path")        
      });

      this.$el.find(".url-pattern .output").html(urlParams.scheme + "://" + urlParams.host +"/" + urlParams.path);
      Bridge.set(urlParams);
    },

    toggleUrlInput: function(){
      this.$el.find(".output, form").toggleClass("hidden");
    },

    scrubPattern: function(params){
      params.scheme = params.scheme.replace(/\*+/g, "*");
      if(params.scheme.length === 0)
        params.scheme = "*";
      
      params.host = params.host.replace(/\*+/g, "*");
      if(params.host.length === 0)
        params.host = "*";

      params.path = params.path.replace(/\*+/g, "*");
      
      return params;
    },


    _handleStreamConnectionState: function(state){

      switch( state ){

        case "connected":

        break;

      }
    },

    _onStreamShareConnected: function(){
      this.$el.find(".share").css("font-weight", "bold");
    },


    _onStreamShareDisconnected: function(){
      this.$el.find(".share").css("font-weight", "bold");
    },

    _onStreamShareAuthFail: function(){
      this.toggleSubbar();
    },
    
    toggleStreamShare: function(){

      this.streamSharing = !this.streamSharing;
      console.info("[StreamShare] Toggling StreamShare.", this.streamSharing);
      Bridge.sendToBackground({
        event: "streamshare",
        data: {
          enabled: this.streamSharing
        }
      });
    }

  });
});
