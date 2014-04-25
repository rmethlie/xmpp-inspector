define(['BaseModel'], function(BaseModel) {
  "use strict";

  return BaseModel.extend({

    defaults: {
      active: false
    },

    initialize: function(options){
      
    },

    toggle: function(){
      this.set("active", !this.get("active"));
    },

    apply: function(stream){
      console.log("[BaseFilter.model] apply. This should be overwritten");
    }
    

  });
});
