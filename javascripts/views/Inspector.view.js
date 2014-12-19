define(["BaseView",
  "InspectorModel",
  "ResponseListener",
  "StreamsView",
  "StreamToolbarView",
  "Streams",
  "StreamsManager",
  'text!templates/inspector.template.html',
  'lib/utils'],
  function( BaseView, InspectorModel, ResponseListener, StreamsView, StreamToolbarView,
    Streams, StreamsManager, inspectorTemplate, Utils ) {

  "use strict";

  return BaseView.extend({

    el: "body",

    stream: null,
    
    toolbar: null,

    template: _.template(inspectorTemplate),

    initialize: function(){
      this.model = new InspectorModel();
      var urlManifest = this.model.loadUrlManifest();
      this.render({patterns: urlManifest});
      this.addListeners();
    },

    render: function(options){
      if(!options){
        options = {};
      }
      
      this.$el.html(this.template({}));
      this.renderStream(options);
      this.streamsView.streams.on("change:scheme change:host change:path", this.renderToolbar.bind(this) );
      this.renderToolbar(options);
      this.renderStreamsManager(options);
      this.toggleManager();

    },

    renderToolbar: function(options){
      if(!options){
        options = {};
      }

      options.inspectorView = this;
      this.toolbar = new StreamToolbarView(options);
      this.toolbar.model.on( "toolbar:command", this._handleToolbarCommand.bind(this) );
    },

    renderStream: function(options){
      options = options || {};
      options.inspectorView = this;
      this.streamsView = new StreamsView(options);
      this.children["streams"] = this.streamsView;
    },

    renderStreamsManager: function(options){
      this.streamsManager = new StreamsManager({
        sources: this.streamsView.getSources(),
        inspectorView: this
      });
      this.children["manager"] = this.streamsManager;
    },

    addListeners: function(){

      document.addEventListener("keydown", function(event){
        
        // cmd+f or ctrl+f trigger search (we're not picky)
        if((event.metaKey || event.ctrlKey) && event.which === 70){
          Utils.stopEvent(event);
          this.initSearch();
          return false;
        }
        
        // ESC cancels search state
        if(this.model.get("state") === "search" && event.which === 27){
          Utils.stopEvent(event);
          this.cancelSearch();
          return false;
        }
        // ESC cancels manage state
        if(this.model.get("state") === "manage" && event.which === 27){
          Utils.stopEvent(event);
          this.showStreams();
          return false;
        }
      }.bind(this), true);

    },

    getState: function(){
      this.model.get("state");
    },

    initSearch: function(){
      this.model.set("state", "search");
      var input = this.$el.find("#searchInput");
      input.focus().select();
      var query = input.val();

      // if a query is already in the bar search for it automatically
      if(query.length)
        this.toolbar.submitSearch();
    },

    cancelSearch: function(){
      this.model.set("state", null);
      this.trigger("search:cancel");
    },

    _handleToolbarCommand: function( command ){
      switch( command.name ){
        case "clear":
          this.streamsView.clear();
          break;
        case "copy":
          this.streamsView.copy();
          break;
        case "url-pattern-update":
          this.streamsView.model.updateFilter(command.pattern);
          break;
        case "toggle-subbar":
          this.streamsView.toggleForSubbar(command.state);
          break;

        default:
          console.error( "[STREAM.VIEW] Unknown command: ", command );
      }
    },

    showBookmarkManager: function(){
      this.showOnly("manager");
      this.model.set("state", "manage");
      this.toolbar.$el.find(".button.streams").removeClass("active");
      this.toolbar.$el.find(".button.url-pattern").addClass("active");
    },

    hideBookmarkManager: function(){
      this.children["manager"].hide();
      this.model.set("state", null);
    },

    showStreams: function(){
      this.showOnly("streams");
      this.model.set("state", null);
      this.toolbar.$el.find(".button.streams").addClass("active");
      this.toolbar.$el.find(".button.url-pattern").removeClass("active");
    },

    hideStreams: function(){
      this.streamsView.hide();
    },

    toggleManager: function(){
      if(this.model.get("state") === "manage"){
        this.hideBookmarkManager();
        return;
      }
      this.showBookmarkManager();
    }
  });
});
