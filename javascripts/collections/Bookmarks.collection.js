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
      var saveData = [];
      this.each(function(bookmark){
        var attributes = _.clone(bookmark.attributes);
        attributes.enable =  false;
        saveData.push(attributes);
      });

      saveData = JSON.stringify( saveData );
      localStorage.setItem("bookmarks", saveData);
    },

    load: function(){
      this.add( JSON.parse(localStorage.getItem("bookmarks")) );
    },

  });
});
