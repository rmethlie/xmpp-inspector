define(["BaseView",
  "XMPPStreamToolbarModel",
  'text!templates/toolbar.template.html'], function(BaseView, XMPPStreamToolbarModel, toolbarTemplate) {
  "use strict";

  return BaseView.extend({

    model: new XMPPStreamToolbarModel(),

    el: ".toolbar-wrapper",

    template: _.template(toolbarTemplate),

    events: {
      "click .button.reload"  : "reload",
      "click .button.clear"   : "clear",
      "click .button.options" : "options",
      "click .url-pattern .output" : "toggleUrlInput",
      "click .url-pattern [type='submit']" : "updateUrlParams",
    },

    initialize: function(options){
      console.info( "[TOOLBAR] Initialized.");      
      this.render(options);
    },

    render: function(options){
      this.$el.html(this.template({
        filter: this.scrubPattern(options.filter)
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

    options: function(e){
      var  $button = this.$el.find(".button.options");
      $button.toggleClass("accordian");
    },

    updateUrlParams: function(e){
      e.preventDefault();
      e.stopPropagation();
      var urlParams = this.scrubPattern({
        scheme  : this.$el.find("form .scheme").val(),
        host    : this.$el.find("form .host").val(),
        path    : this.$el.find("form .path").val()
        
      });

      this.$el.find(".url-pattern .output").html(urlParams.scheme + "://" + urlParams.host +"/" + urlParams.path);
      this.model.trigger("toolbar:command", {name: "url-pattern-update", pattern: urlParams});

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
