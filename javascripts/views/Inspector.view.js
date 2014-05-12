define(["BaseView",
  "Stream",
  "XMPPStreamView",
  "StreamToolbarView",
  'text!templates/inspector.template.html',], function(BaseView, Stream, XMPPStreamView, StreamToolbarView, inspectorTemplate) {
  "use strict";

  return BaseView.extend({

    el: "body",

    stream: null,
    
    toolbar: null,

    template: _.template(inspectorTemplate),

    initialize: function(){
      this.stream = new Stream();
      this.listenTo(this.stream, "ready", function(stream){
        this._onStreamReady(stream);
      });
      this.stream.connect();
    },

    render: function(){
      this.$el.html(this.template({}));
    },

    renderToolbar: function(options){
      this.toolbar = new StreamToolbarView(options);
    },

    renderStream: function(stream){
      this.stream = new XMPPStreamView({
        model: stream,
      });
    },

    addListeners: function(){
      this.listenTo(this.toolbar.model, "toolbar:command", this._handleToolbarCommand);
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

    _onStreamReady: function(stream){
      var streamOptions = {
        filter : stream.get("urlParams")
      };
      this.render();
      this.renderToolbar({filter: streamOptions.filter});
      this.renderStream(stream);
      this.addListeners();
    },

  });
});
