define(['backbone'], function(Backbone) {
  "use strict";

  return Backbone.View.extend({
    
    
    initialize: function(){
      console.log("[BaseView] initialize");
    },

    show: function(){
      console.log("[BaseView] show");
      this.$el.removeClass("hidden");
    },

    hide: function(){
      console.log("[BaseView] hide");
      this.$el.addClass("hidden");
    },

  });
});
