define(["BaseView"], function(BaseView) {
  "use strict";

  return BaseView.extend({
    
    el : "#stream-manager",

    initialize: function(){
      this.render();
    },

  });
});
