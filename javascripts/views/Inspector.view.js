define(["BaseView",
  "Stream",
  "XMPPStream",
  "XMPPStreamView",
  "StreamToolbarView",
  'text!templates/inspector.template.html',], function(BaseView, Stream, XMPPStream, XMPPStreamView, StreamToolbarView, inspectorTemplate) {
  "use strict";

  return BaseView.extend({

    el: "body",

    stream: null,
    
    toolbar: null,

    template: _.template(inspectorTemplate),

    initialize: function(){
      var streamOptions = {
        pattern : {scheme: "http", host: "*", path: "*http-bind*"}
      };
      this.render();
      this.renderToolbar({pattern: streamOptions.pattern});
      this.renderStream(streamOptions);
      this.addListeners();
    },

    render: function(){
      this.$el.html(this.template({}));
    },

    renderToolbar: function(options){
      this.toolbar = new StreamToolbarView(options);
    },

    renderStream: function(options){
      this.stream = new XMPPStreamView({
        model: new XMPPStream(options)
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
