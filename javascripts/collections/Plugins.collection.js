define(['BaseCollection', 'models/Plugin.model'], function(BaseCollection, Plugin) {
  "use strict";
     
  return BaseCollection.extend({
    
    model: Plugin,

    initialize: function(){
      console.log("[PluginCollection] initialize");
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
      localStorage.setItem("plugins", saveData);
    },

    load: function(){
      this.add( JSON.parse(localStorage.getItem("plugins")) );
    },

  });
});
