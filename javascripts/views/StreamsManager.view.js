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
      "click .add-new .show": "showAddInput",
      "submit .new-url-pattern": "addStream"
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
      var html = "";
      options.sources.each( function(stream){
        html += this.renderUrl({ model: stream });
      }.bind(this));

      return html;
    },
      
    renderUrl: function(options){
      return this.urlTemplate(options);
    },

    showAddInput: function(e){
      console.log("showAddInput");
      var $form = this.$el.find(".add-new .new-url-pattern");
      $form.removeClass("hidden");
      $form.find('.scheme').focus();
    },

    addStream: function(e){
      if(!e.target)
        return;
      var $form  = $(e.target)
      var data = this.scrubPattern({
        scheme: $form.find('.scheme').val(),
        host: $form.find('.host').val(),
        path: $form.find('.path').val()
      });
      this.trigger("stream:add", data);
    },

    scrubPattern: function(params){
      if(!params || !params.scheme || !params.host || !params.path){
        return false;
      }

      params.scheme = params.scheme.replace(/\*+/g, "*");
      if(params.scheme.length === 0)
        params.scheme = "*";
      
      params.host = params.host.replace(/\*+/g, "*");
      if(params.host.length === 0)
        params.host = "*";

      params.path = params.path.replace(/\*+/g, "*");
      
      return params;
    },
  });
});
