define(['BaseView', 
  'text!templates/stream-data.template.html', 
  'text!templates/stream-data-wrapper.template.html',
  'codemirror/mode/xml/xml',
  'beautifier/beautify-html'], 
  function(BaseView, streamDataTemplate, streamDataWrapperTemplate) {
  "use strict";
  
  var format = require('beautifier/beautify-html');  
  var CodeMirror = require('codemirror/lib/codemirror');
  return BaseView.extend({
    
    el: "#stream",

    requestSentPrefix: "",

    responseReceivedPrefix: "",

    template: _.template(streamDataTemplate),    

    atBottom: true,

    dataStreamConfig: {
      mode: "text/html",
      lineNumbers: true,
      lineWrapping: true,
      readOnly: true,
      theme: "xmpp default", // apply our modifications to the default CodeMirror theme.
    }, 

    initialize: function(options){
      console.log("[StreamView] initialize");
      this.render();
      this.dataStream = CodeMirror.fromTextArea(document.getElementById("dataStream"), this.dataStreamConfig);
      this.addlisteners();
      this.model.connect();      
    },

    addlisteners: function(){
      var _this = this;

      this.listenTo(this.model, "request:sent", function(content){
        this.appendData(content, {prefix: this.requestSentPrefix});
      });

      // TOOLBAR
      this.toolbar = options.toolbar;
      this.toolbar.on("toolbar:command", this._handleToolbarCommand.bind(this));

      this.listenTo(this.model, "request:finished", function(packet, content){
        this.appendData(content, {prefix: this.responseReceivedPrefix});
      });

    },

    render: function(){
      this.$el.html(this.template({}));
      return this;
    },

    guidGen: function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    },

    isAtBottom: function(){
      var scrollInfo = this.dataStream.getScrollInfo();
      if(scrollInfo.clientHeight + scrollInfo.top === scrollInfo.height)
        return true
      else
        return false
      
    },

    _handleToolbarCommand: function( command ){

      switch( command.name ){

        case "clear":
          this.dataStream.setValue("");
          this.dataStream.clearHistory();
          this.dataStream.clearGutter();
        break;

        default: 
        console.error( "[STREAM.VIEW] Unknown command: ", command );
        break;
      }
    },

    appendData: function(content, options){
      if(!options)
        options = {}

      var scollToBottom = false;
      var lastLineNumber = this.dataStream.lastLine();
      var lastLineHandler = this.dataStream.getLineHandle(lastLineNumber);
      var lastLineCharCount = lastLineHandler.text.length;
      
      content = format.html_beautify(content);
      if(options.prefix)
        content = options.prefix + content;

      content += "\n";
      
      // if the user is already at  the bottom of the stream scroll to the bottom after appending the new content
      if(this.isAtBottom()){
        scollToBottom = true;
      }

      if(content){
        this.dataStream.replaceRange(content, {line: Infinity, ch: lastLineCharCount});
      }

      if(scollToBottom){
        this.dataStream.scrollIntoView({line: this.dataStream.lastLine(), ch: 1});
      }


    }

  });
});
