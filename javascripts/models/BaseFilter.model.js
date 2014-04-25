define(['BaseModel'], function(BaseModel) {
  "use strict";

  return BaseModel.extend({

    defaults: {
      active: false;
    }

    initialize: function(options){
      
    },

    toggle: function(){
      var state = this.get("active");
      this.set("active", !state);
    },

    apply: function(stream){
      console.log("[BaseFilter.model] apply. This should be overwritten");
    },

    remove: function(){
      console.log("[BaseFilter.model] remove. This should be overwritten");
    },
    

  });
});
