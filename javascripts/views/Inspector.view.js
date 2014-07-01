define(["BaseView",
  "ResponseListener",
  "XMPPStreamView",
  "StreamToolbarView",
  "Stream",
  'text!templates/inspector.template.html',], function(BaseView, ResponseListener, XMPPStreamView, StreamToolbarView, Stream, inspectorTemplate) {
  "use strict";

  return BaseView.extend({

    el: "body",

    stream: null,
    
    toolbar: null,

    template: _.template(inspectorTemplate),

    initialize: function(){
      this.render();
      this.addListeners();
    },

    render: function(){
      this.$el.html(this.template({}));
      this.renderStream();
      this.stream.model.on("change:scheme change:host change:path", this.renderToolbar.bind(this) );
      this.renderToolbar(this.stream.model.defaults)
    },

    renderToolbar: function(options){
      if( this.toolbar ){
        // sync
        this.toolbar.model.set(options);
        return;
      }

      this.toolbar = new StreamToolbarView(options);
      this.toolbar.model.on("change",function(data){
        this.stream.model.sendToBackground( data.changed );
        this.stream.model.set(data.changed,{silent:true});
      }.bind(this));

      this.toolbar.model.on( "toolbar:command", this._handleToolbarCommand.bind(this) );
    },

    renderStream: function(){
      this.stream = new XMPPStreamView({
        // model: new ResponseListener()
        model: new Stream()
      });
    },

    addListeners: function(){
    },

    _handleToolbarCommand: function( command ){
      switch( command.name ){
        case "clear":
          this.stream.clear();
        break;
        case "copy":
          this.stream.copy();
        break;
        case "url-pattern-update":
          this.stream.model.updateFilter(command.pattern);
        break;
        case "toggle-subbar":
          this.stream.toggleForSubbar();
        break;

        default:
          console.error( "[STREAM.VIEW] Unknown command: ", command );
      }
    },

  });
});
