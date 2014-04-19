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
      "click .button.options" : "options"
    },

    initialize: function(){
      console.info( "[TOOLBAR] Initialized.");
      this.render();
    },

    render: function(){
      this.$el.html(this.template({}));
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

    options: function($event){
      var  $button = this.$el.find(".button.options");
      $button.toggleClass( "accordian" );
    }

  });
});
