define(["BaseView",
  "ResponseListener",
  "XMPPStreamView",
  "StreamToolbarView",
  'text!templates/inspector.template.html','Bridge'], function(BaseView, ResponseListener, XMPPStreamView, StreamToolbarView, inspectorTemplate, Bridge) {
  "use strict";

  var
  Bridge = new Bridge({
    // no defaults yet...
  },{
    env: 'panel'
  });

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

      // build the UI template
      this.$el.html(this.template({}));

      // render stream view (CodeMirror)
      this.renderStreamView();
      this.renderToolbar(this.stream.model.defaults)
    },

    renderStreamView: function(){
      this.stream = new XMPPStreamView({
        model: Bridge
      });

      this.responseListener = new ResponseListener({}, {
        Bridge: Bridge
      });
    },

    renderToolbar: function(){

      this.toolbarView = new StreamToolbarView({
        model: Bridge
      });

      Bridge.on({
        "toolbar:command" : this._handleToolbarCommand.bind(this)
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
          this.responseListener.updateFilter(command.pattern);
        break;
        case "toggle-subbar":
          this.stream.toggleForSubbar();
        break;

        case "streamshare":
          this.stream.streamShare( command.data.enabled );
          Bridge.on("streamdata", this.toolbar._handleStreamData.bind(this.toolbar));
        break;

        default:
          console.error( "[STREAM.VIEW] Unknown command: ", command );
      }
    },

  });
});
