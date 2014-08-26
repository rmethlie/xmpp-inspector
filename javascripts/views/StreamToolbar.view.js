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
      "click .button.find"   : "startSearch",
      "click .button.clear"   : "clear",
      "click .button.options" : "options",
      "click .button.show-sub-bar" : "toggleSubbar",
      "click .url-pattern .label" : "toggleUrlInput",
      "click .update-url-pattern  [type='submit']" : "updateUrlPattern",
      "click .search .cancel" : "cancelSearch",
    },

    initialize: function(options){
      console.info( "[TOOLBAR] Initialized.");
      this.inspectorView = options.inspectorView;
      this.render(options.urlPattern);
      this.addListeners();

    },

    addListeners: function(){

      var $searchInput = $(this.$el.find("#searchInput")[0]);

      this.listenTo(this.inspectorView, "search:init", function(){
        this.showSearchBar();
      });

      this.listenTo(this.inspectorView, "search:cancel", function(){
        this.hideSearchBar();
      });

      this.$el.find(".search form").on("submit", function(e){
        Utils.stopEvent(e.originalEvent);
      }.bind(this));

      $searchInput.on("keydown", function(e){
        if(e.shiftKey)
          this.shiftKey = true;
      }.bind(this));

      $searchInput.on("keyup", function(e){
        if(!e.shiftKey)
          this.shiftKey = false;

        // if this is a visible character then begin auto search
        if(Utils.isKeyCodeVisible(e.keyCode))
          _.debounce(this.submitSearch(e), 300);

      }.bind(this));

    },

    render: function(defaults){
      defaults = defaults || this.model.urls.at(0);
      var data = {
          filter: this.scrubPattern(defaults) || Utils.defaultListenerAttributes
        };

      this.$el.html(this.template(data));
    },

    reload: function(){
      document.location.reload();
    },

    showSearchBar: function(){
      this.toggleSubbar("show");
      this.$el.find(".sub-bar .search").removeClass("hidden");
      var input = this.$el.find("#searchInput");
      input.focus().select();
      var query = input.val()

      // if a query is already in the bar search for it automatically
      if(query.length)
        this.submitSearch();

    },

    hideSearchBar: function(){
      this.$el.find(".sub-bar .search").addClass("hidden");
      this.toggleSubbar("hide");
    },

    submitSearch: function(e){
      if(e)
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

    startSearch: function(e){
      Utils.stopEvent(e);
      this.inspectorView.initSearch();
    },

    cancelSearch: function(e){
      Utils.stopEvent(e);
      this.inspectorView.cancelSearch();
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
      this.getActiveUrl.set(urlParams);

      this.toggleUrlInput();
      this.trigger("change:url");
    },

    toggleUrlInput: function(){
      this.$el.find(".output, form").toggleClass("hidden");
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

    addURL: function(attributes){
      this.model.urls.add(attributes);
    },
    
    getActiveUrl: function(){
      var index = this.model.urlsCursor;
      return this.model.urls.at(index);
    },

  });
});
