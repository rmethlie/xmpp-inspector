define(["BaseView",
  "Stream",
  "XMPPStreamView",
  "XMPPStreamToolbarView",
  'text!templates/inspector.template.html',], function(BaseView, Stream, XMPPStreamView, XMPPStreamToolbarView, inspectorTemplate) {
  "use strict";

  return BaseView.extend({

    el: "body",

    stream: null,
    
    toolbar: null,

    template: _.template(inspectorTemplate),

    initialize: function(){
      this.render();
      this.renderToolbar();
      this.renderStream();

      this.toolbar.model.on("toolbar:command", this._handleToolbarCommand.bind(this));
    },

    render: function(){
      this.$el.html(this.template({}));
    },

    renderToolbar: function(){
      this.toolbar = new XMPPStreamToolbarView();
    },

    renderStream: function(){
      this.stream = new XMPPStreamView({
        model: new Stream(),
        toolbar: this.toolbar.model
      });
    },

    _handleToolbarCommand: function( command ){
      switch( command.name ){
        case "clear":
          this.stream.clear();
        break;

        default:
          console.error( "[STREAM.VIEW] Unknown command: ", command );
      }
    },

  });
});
