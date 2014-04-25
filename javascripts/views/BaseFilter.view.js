define(['BaseView'],
  function(BaseView) {
  "use strict";
  
  return BaseView.extend({

    "click": "toggleFilter",

    initialize: function(options){
      
    },

    toggleFilter: function(){
      this.model.toggle();
      // now update the button
    }


  });
});
