define(['BaseCollection'], function(BaseCollection) {
  "use strict";
     
  return BaseCollection.extend({
    
    initialize: function(){
      console.log("[BaseCollection] initialize");
      this.load();

      this.on("add remove reset", this.save);
    },

    save: function(){
      localStorage.setItem("bookmarks", JSON.stringify(this.toJSON()));
    },

    load: function(){
      this.add( JSON.parse(localStorage.getItem("bookmarks")) );
    },

  });
});
