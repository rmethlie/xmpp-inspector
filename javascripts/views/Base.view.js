define(['backbone'], function(Backbone) {
  "use strict";

  return Backbone.View.extend({
    
    
    initialize: function(){
      console.log("[BaseView] initialize");
    },

    show: function(name){
      console.log("[BaseView] show");
      if(name)
        this.children[name].show();
      else
        this.$el.removeClass("hidden");
    },

    hide: function(name){
      console.log("[BaseView] hide");
      if(name)
        this.children[name].show();
      else
        this.$el.addClass("hidden");
    },

    children: [],

    showOnly: function(name){
      var subViews = this.children;

      for(var view in subViews){
        if(view === name){
          subViews[view].$el.removeClass("hidden");
        } else {
          subViews[view].$el.addClass("hidden");
        }
      }

    }

  });
});
