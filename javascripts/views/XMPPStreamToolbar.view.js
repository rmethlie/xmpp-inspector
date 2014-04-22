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
      "click .url-pattern .output" : "editUrlPattern",
      "click .url-pattern [type='submit']" : "updateUrlPattern",
    },

    initialize: function(options){
      console.info( "[TOOLBAR] Initialized.");
      
      this.render(options);
    },

    render: function(options){
      this.$el.html(this.template({
        filter: options.filter
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
      $button.toggleClass( "accordian" );
    },

    editUrlPattern: function(){
      this.toggleUrlInput();
    },
    
    updateUrlPattern: function(e){
      e.preventDefault();
      e.stopPropagation();
      var pattern = {
        scheme  : this.$el.find("form .scheme").val(),
        host    : this.$el.find("form .host").val(),
        path    : this.$el.find("form .path").val(),
      }
      this.toggleUrlInput();
    },

    toggleUrlInput: function(){
      console.log("toggling");
      this.$el.find(".output, form").toggleClass("hidden");
      // this.$el.find("form").toggleClass("hidden");
    }
    

  });
});
