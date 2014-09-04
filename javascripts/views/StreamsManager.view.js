define(["BaseView", 
  'text!templates/streamsManager.template.html', 
  'text!templates/streamItem.template.html'], 

  function(BaseView, streamsManagerTemplate, itemTemplate) {
  "use strict";

  return BaseView.extend({
    
    el : "#stream-manager",

    template: _.template(streamsManagerTemplate),
    urlTemplate: _.template(itemTemplate),

    initialize: function(options){
      this.render(options);
    },

    render: function(options){
      if(!options)
        options = {};

      this.$el.html(this.template(options));
      this.renderUrls(options);
    },

    renderUrls: function(options){
      var html = "";
      // var streamsCount = options.sources.length;
      options.sources.each( function(stream){
        html += this.renderUrl({ model: stream });
      });

      return html;
    },
      
    renderUrl: function(options){
      return this.urlTemplate(options);
    },
  });
});
