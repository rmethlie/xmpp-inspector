define(["BaseView", 'text!templates/streamsManager.template.html',], function(BaseView, streamsManagerTemplate) {
  "use strict";

  return BaseView.extend({
    
    el : "#stream-manager",

    template: _.template(streamsManagerTemplate),

    initialize: function(options){
      this.render(options);
    },

    render: function(options){
      if(!options)
        options = {};

      this.$el.html(this.template(options));

    },
  });
});
