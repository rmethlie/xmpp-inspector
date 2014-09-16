define(['BaseCollection', 'Bookmark'], function(BaseCollection, Bookmark) {
  "use strict";
     
  return BaseCollection.extend({
    
    model: Bookmark,

    initialize: function(){
      console.log("[BaseCollection] initialize");
      this.load();

      this.on("add remove reset", this.save);
    },

    save: function(){
      var saveData = "";
      this.each(function(bookmark){
        saveData += JSON.stringify({
          format: bookmark.get("format"),
          scheme: bookmark.get("scheme"),
          host  : bookmark.get("host"),
          path  : bookmark.get("path")
        });
      });

      localStorage.setItem("bookmarks", saveData);
    },

    load: function(){
      this.add( JSON.parse(localStorage.getItem("bookmarks")) );
    },

  });
});
