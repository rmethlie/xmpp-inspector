define(["BaseView", 
  'text!templates/streamsManager.template.html', 
  'text!templates/streamItem.template.html'], 

  function(BaseView, streamsManagerTemplate, itemTemplate) {
  "use strict";

  return BaseView.extend({
    
    el : "#stream-manager",

    template: _.template(streamsManagerTemplate),

    urlTemplate: _.template(itemTemplate),

    events: {
      "click .add-new .show": "showAddInput"
    },

    initialize: function(options){
      this.render(options);
    },

    render: function(options){
      if(!options)
        options = {};

      this.$el.html(this.template(options));
      var list = this.renderUrls(options);
      this.$el.find("#stream-manager-list").append(list);
    },

    renderUrls: function(options){
      var html = "hi";
      options.sources.each( function(stream){
        html += this.renderUrl({ model: stream });
      });

      return html;
    },
      
    renderUrl: function(options){
      return this.urlTemplate(options);
    },

    showAddInput: function(e){
      this.$el.find(".add-new .update-url-pattern").removeClass("hidden");
      console.log("showAddInput");
    },
  });
});
