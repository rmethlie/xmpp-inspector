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

    // map the line number in the data stream to the networkEvent stored in the model
    networkEventMap: {},

    initialize: function(options){
      console.log("[StreamView] initialize");
      this.render();
      this.dataStream = CodeMirror.fromTextArea(document.getElementById("dataStream"), this.dataStreamConfig);
      this.addlisteners(options);
      this.model.connect();      
    },

    addlisteners: function(options){
      var _this = this;

      this.listenTo(this.model, "request:sent", function(data){
        this.appendData(data, {prefix: this.requestSentPrefix});
      });

      this.listenTo(this.model, "request:finished", function(data){
        this.appendData(data, {prefix: this.responseReceivedPrefix});
      });

      this.toolbar = options.toolbar;
      this.toolbar.on("toolbar:command", this._handleToolbarCommand.bind(this));

    },

    render: function(){
      this.$el.html(this.template({}));
      return this;
    },

    isAtBottom: function(){
      var scrollInfo = this.dataStream.getScrollInfo();
      if(scrollInfo.clientHeight + scrollInfo.top === scrollInfo.height)
        return true;
      else
        return false;
      
    },

    _handleToolbarCommand: function( command ){

      switch( command.name ){

        case "clear":
          this.clear();
        break;

        default: 
        console.error( "[STREAM.VIEW] Unknown command: ", command );
        break;
      }
    },

    getLastLineInfo: function(){
      // note: lastLine() return value is one less than the number displayed in the gutter, must be 0 indexed,
      //  but the value still works for getting the line handler & content so no need to offset by one
      //  use lineCount() to get the displayed line number
      var lastLineNumber = this.dataStream.lastLine(); 
      var handler = this.dataStream.getLineHandle(lastLineNumber);

      return {
        number    : lastLineNumber,
        handler   : handler,
        charCount : handler.text.length
      };
    },

    appendData: function(data, options){
      if(!options)
        options = {}
      var content = data.body;
      var scollToBottom = false;
      var lastLine = this.getLastLineInfo();      

      // content += "\n";
      
      // if the user is already at  the bottom of the stream scroll to the bottom after appending the new content
      if(this.isAtBottom()){
        scollToBottom = true;
      }

      if(content){
        content = format.html_beautify(content);
        
        if(options.prefix){ 
          this.dataStream.replaceRange(options.prefix, {line: Infinity, ch: lastLine.charCount});
          lastLine = this.getLastLineInfo();
        }

        this.dataStream.replaceRange(content, {line: Infinity, ch: lastLine.charCount});
        this.networkEventMap["line:" + lastLine.number] = data.id;
      }

      if(scollToBottom){
        this.dataStream.scrollIntoView({line: this.dataStream.lastLine(), ch: 1});
      }
    },

    clear: function(){      
      this.dataStream.setValue("");
      this.dataStream.clearHistory();
      this.dataStream.clearGutter();
    },

  });
});
