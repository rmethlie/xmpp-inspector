define(["BaseView",
  "StreamToolbarModel",
  'text!templates/toolbar.template.html'], function(BaseView, StreamToolbarModel, toolbarTemplate) {
  "use strict";

  return BaseView.extend({

    model: new StreamToolbarModel(),

    el: ".toolbar-wrapper",

    template: _.template(toolbarTemplate),

    events: {
      "click .button.reload"  : "reload",
      "click .button.copy"   : "copy",
      "click .button.clear"   : "clear",
      "click .button.options" : "options",
      "click .button.show-sub-bar" : "toggleSubbar",
      "click .url-pattern .label" : "toggleUrlInput",
      "click .update-url-pattern  [type='submit']" : "updateUrlPattern",
    },

    initialize: function(defaults){
      console.info( "[TOOLBAR] Initialized.");      
      this.render(defaults);
    },

    render: function(defaults){
      defaults = defaults || this.model.attributes;
      this.$el.html(this.template({
        filter: this.scrubPattern(defaults)
      }));
    },

    reload: function(){
      document.location.reload();
    },

    clear: function(){
      // clear stream list
      this.model.trigger("toolbar:command", {
        name: "clear",
        data: {}
      });
    },

    copy: function(){
      this.model.trigger("toolbar:command", {
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
      this.model.trigger("toolbar:command", {
        name: "toggle-subbar"
      });
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
      this.model.set(urlParams);

      this.toggleUrlInput();
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
    

  });
});
