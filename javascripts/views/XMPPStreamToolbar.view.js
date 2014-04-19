define(["BaseView","XMPPStreamToolbarModel"], function(BaseView, XMPPStreamToolbarModel) {
  "use strict";

  return BaseView.extend({

    model: new XMPPStreamToolbarModel(),
    
    el: "#xmpp-inspector-toolbar",

    events: {
      "click .button"         : "onClick",
      "click .button.reload"  : "reload",
      "click .button.clear"   : "clear",
      "click .button.options" : "options"
    },

    initialize: function(){
      console.info( "[TOOLBAR] Initialized.");
    },

    onClick: function(){
      // console.info( "[TOOLBAR] Button click.");
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
      var 
      $button = this.$el.find(".button.options");
      $button.toggleClass( "accordian" );
    }

  })
});
