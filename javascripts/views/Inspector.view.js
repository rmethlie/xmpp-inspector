define(["BaseView",
  "InspectorModel",
  "ResponseListener",
  "XMPPStreamView",
  "StreamToolbarView",
  "Streams",
  'text!templates/inspector.template.html',
  'lib/utils'], 
  function(BaseView, InspectorModel, ResponseListener, XMPPStreamView, StreamToolbarView, Streams, inspectorTemplate, Utils) {
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
    },

    render: function(){
      this.$el.html(this.template({}));
      this.renderStream();
      // this.streamsView.streams.on("change:scheme change:host change:path", this.renderToolbar.bind(this) );
      // this.renderToolbar(this.streamsView.model.defaults);
    },

    renderToolbar: function(options){
      if(!options){
        options = {};
      }

      if( this.toolbar ){
        // sync
        this.toolbar.model.set(options);
        return;
      }

      options.inspectorView = this;
      this.toolbar = new StreamToolbarView(options);
      this.toolbar.model.on("change",function(data){
        this.streamsView.model.sendToBackground( data.changed );
        this.streamsView.model.set(data.changed,{silent:true});
      }.bind(this));

      this.toolbar.model.on( "toolbar:command", this._handleToolbarCommand.bind(this) );
    },

    renderStream: function(){
      this.streamsView = new XMPPStreamView({
        inspectorView: this
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
