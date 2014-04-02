define(['BaseView', 'prettyPrint'], function(BaseView, prettyPrint) {
  "use strict";

  return BaseView.extend({
    
    el: "#stream",
    
    initialize: function(){
      //todo: create a BaseModel, BaseView & BaseCollection 
      console.log("[StreamView] initialize");
    },

    // Description: Encoded mark up languages, like HTML and XML, for display on a webpage
    formatMarkUp: function(markup){
      return markup.replace(/</g, '&lt;')
               .replace(/>/g, '&gt;');
    },

    append: function(content){
      this.$el.append("<div><pre>" + content + "</pre></div>");
    }

  });
});
