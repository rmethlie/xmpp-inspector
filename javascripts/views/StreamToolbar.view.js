define(["BaseView",
  "StreamToolbarModel",
  'text!templates/toolbar.template.html',
  'lib/utils'], function(BaseView, StreamToolbarModel, toolbarTemplate, Utils) {
  "use strict";

  return BaseView.extend({

    model: new StreamToolbarModel(),

    el: ".toolbar-wrapper",

    template: _.template(toolbarTemplate),

    events: {
      "click .button.reload"  : "reload",
      "click .button.copy"   : "copy",
      "click .button.clear"   : "clear",
      "click .button.options" : "options",
      "click .button.show-sub-bar" : "toggleSubbar",
      "click .url-pattern .label" : "toggleUrlInput",
      "click .update-url-pattern  [type='submit']" : "updateUrlPattern",
      "submit .search form": "submitSearch"
    },

    initialize: function(options){
      console.info( "[TOOLBAR] Initialized.");
      this.inspectorView = options.inspectorView;
      this.render(options);
      this.addListeners();

    },

    addListeners: function(){

      this.listenTo(this.inspectorView, "search:init", function(){
        this.showSearchBar();
      });

      this.listenTo(this.inspectorView, "search:cancel", function(){
        this.hideSearchBar();
      });

      this.$el.on("keydown", function(e){
        if(e.shiftKey)
          this.shiftKey = true;
      }.bind(this));

      this.$el.on("keyup", function(e){
        if(!e.shiftKey)
          this.shiftKey = false;

        this.submitSearch(e);

      }.bind(this));

    },

    render: function(defaults){
      defaults = defaults || this.model.attributes;
      this.$el.html(this.template({
        filter: this.scrubPattern(defaults)
      }));
    },

    reload: function(){
      document.location.reload();
    },

    showSearchBar: function(){
      this.toggleSubbar("show");
      this.$el.find(".sub-bar .search").removeClass("hidden");
      var query = this.$el.find("#searchInput").focus().select();

    },

    hideSearchBar: function(){
      this.$el.find(".sub-bar .search").addClass("hidden");
      this.toggleSubbar("hide");
    },

    submitSearch: function(e){
      Utils.stopEvent(e.originalEvent);
      var query = {
        query   : this.$el.find("#searchInput").val().toLowerCase(), // toLowerCase() triggers case-insensitive search
        reverse : this.shiftKey
      };

      this.inspectorView.trigger("search:submit", query);
    },

    clear: function(){
      // clear stream list
      this.model.trigger("toolbar:command", {
        name: "clear",
        data: {}
      });
    },

    copy: function(){
      this.model.trigger("toolbar:command", {
        name: "copy",
        data: {}
      });
    },

    options: function(e){
      var  $button = this.$el.find(".button.options");
      $button.toggleClass("accordian");
    },

    toggleSubbar: function(state){
      if(!state)
        state = null
      switch(state){
        case "show":
          this.$el.find(".sub-bar").removeClass("hidden");
          break;
        case "hide":
          this.$el.find(".sub-bar").addClass("hidden");
          break;
        default: 
          this.$el.find(".sub-bar").toggleClass("hidden");
        
      }
      this.model.trigger("toolbar:command", {
        name: "toggle-subbar",
        state: state
      });
    },

    updateUrlPattern: function(e){
      e.preventDefault();
      e.stopPropagation();
      var urlParams = this.scrubPattern({
        scheme  : this.$el.find("form .scheme").val() || this.model.get("scheme"),
        host    : this.$el.find("form .host").val() || this.model.get("host"),
        path    : this.$el.find("form .path").val() || this.model.get("path")        
      });

      this.$el.find(".url-pattern .output").html(urlParams.scheme + "://" + urlParams.host +"/" + urlParams.path);
      this.model.set(urlParams);

      this.toggleUrlInput();
    },

    toggleUrlInput: function(){
      this.$el.find(".output, form").toggleClass("hidden");
    },

    scrubPattern: function(params){
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
