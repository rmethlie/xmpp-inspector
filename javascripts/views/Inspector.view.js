define(["BaseView",
  "InspectorModel",
  "ResponseListener",
  "XMPPStreamView",
  "StreamToolbarView",
  "Streams",
  "StreamsManager",
  'text!templates/inspector.template.html',
  'lib/utils'], 
  function( BaseView, InspectorModel, ResponseListener, XMPPStreamView, StreamToolbarView, 
    Streams, StreamsManager, inspectorTemplate, Utils ) {

  "use strict";

  return BaseView.extend({

    el: "body",

    stream: null,
    
    toolbar: null,

    template: _.template(inspectorTemplate),

    initialize: function(){
      this.model = new InspectorModel();
      this.render();
      this.addListeners();
      this.initDefaultStream();
    },

    render: function(options){
      if(!options){
        options = {};
      }
      
      this.$el.html(this.template({}));
      this.renderStream(options);
      this.streamsView.streams.on("change:scheme change:host change:path", this.renderToolbar.bind(this) );
      this.renderToolbar(options);
      this.renderStreamsManager();
    },

    renderToolbar: function(options){
      if(!options){
        options = {};
      }

      options.inspectorView = this;
      this.toolbar = new StreamToolbarView(options);
      this.listenTo(this.toolbar, "change:url", function(data){
        this.streamsView.update( data );        
      });

      this.toolbar.model.on( "toolbar:command", this._handleToolbarCommand.bind(this) );
    },

    renderStream: function(){
      this.streamsView = new XMPPStreamView({
        inspectorView: this
      });
    },

    renderStreamsManager: function(){
      this.streamsManager = new StreamsManager({
        streams: this.streamsView.getSources()
      });
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
      }.bind(this), true);

    },

    getState: function(){
      this.model.get("state");
    },

    initSearch: function(){
      this.model.set("state", "search");
      this.trigger("search:init");
    },

    cancelSearch: function(){
      this.model.set("state", null);
      this.trigger("search:cancel");      
    },

    initDefaultStream: function(){
      var params = Utils.defaultListenerAttributes;
      params.name = "default";

      this.streamsView.addSource(params);
      this.toolbar.addURL(params);
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

  });
});
