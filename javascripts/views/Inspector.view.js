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
      var streamOptions = {
        filter : {scheme: "https", host: "*", path: "*http-bind*"}
      };
      this.render();
      this.renderToolbar({filter: streamOptions.filter});
      this.renderStream(streamOptions);
      this.addListeners();
    },

    render: function(){
      this.$el.html(this.template({}));
    },

    renderToolbar: function(options){
      this.toolbar = new XMPPStreamToolbarView(options);
    },

    renderStream: function(options){
      this.stream = new XMPPStreamView({
        model: new Stream(options),
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

        default:
          console.error( "[STREAM.VIEW] Unknown command: ", command );
      }
    },

  });
});
