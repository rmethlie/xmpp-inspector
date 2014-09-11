define(["BaseView", 
  'lib/utils',
  'text!templates/streamsManager.template.html', 
  'text!templates/streamItem.template.html'], 

  function(BaseView, Utils, streamsManagerTemplate, itemTemplate) {
  "use strict";

  return BaseView.extend({
    
    el : "#stream-manager",

    template: _.template(streamsManagerTemplate),

    urlTemplate: _.template(itemTemplate),

    events: {
      "click .close": "close",
      "click .add-new .show": "showAddInput",
      "submit .new-url-pattern": "addStream",
      "click .edit-stream .show": "toggleEditStream",
      "submit .update-url-pattern": "editStream"
    },

    initialize: function(options){
      if(!options)
        options = {};

      this.sources = options.sources;
      this.inspectorView = options.inspectorView;
      this.render(options);
      this.addListeners();
    },

    render: function(options){
      if(!options)
        options = {};

      options.sources = options.sources || this.sources
      this.$el.html(this.template(options));
      var list = this.renderUrls(options);
      this.$el.find("#stream-manager-list").append(list);
    },

    renderUrls: function(options){
      var html = "";
      this.sources.each( function(stream, index){
        html += this.renderUrl({ model: stream, index: index });
      }.bind(this));

      return html;
    },
      
    renderUrl: function(options){
      return this.urlTemplate(options);
    },

    addListeners: function(){
      this.listenTo(this.sources, "add", function(){
        this.render();
      });
    },

    showAddInput: function(e){
      console.log("showAddInput");
      var $form = this.$el.find(".add-new .new-url-pattern");
      $form.removeClass("hidden");
      $form.find('.scheme').focus();
    },

    addStream: function(e){
      Utils.stopEvent(e);
      if(!e.target)
        return;

      var $form  = $(e.target)
      var data = this.scrubPattern({
        scheme: $form.find('.scheme').val(),
        host  : $form.find('.host').val(),
        path  : $form.find('.path').val()
      });

      if(data)
        this.sources.add(data);
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

    close: function(){
      this.inspectorView.toggleManager();
    },

    editStream: function(e){
      Utils.stopEvent(e);
      var index = e.target.getAttribute('data-index');
      var $form = $(this.$el.find("form[data-index='" + index + "']")[0]);
      var $link = $(this.$el.find("a.show[data-index='" + index + "']")[0]);

      var urlParams = this.scrubPattern({
        scheme: $form.find('.scheme').val(),
        host  : $form.find('.host').val(),
        path  : $form.find('.path').val()
      });

      if(urlParams){
        $link.html(urlParams.scheme + "://" + urlParams.host +"/" + urlParams.path);
        this.getActiveUrl().set(urlParams);
        this.toggleUrlInput();
        this.trigger("change:url", urlParams);
      }else{
        this.highlightError(index);
      }

    },

    highlightError: function(index){
      console.log("highlightError", e);

    },

    toggleEditStream: function(e){
      console.log("toggleEditStream", e);
    },

  });
});
