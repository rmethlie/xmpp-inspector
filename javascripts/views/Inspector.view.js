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
      this.toolbar = new StreamToolbarView(options);
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
