define(['BaseView',
  'text!templates/stream-data.template.html',
  'text!templates/stream-data-wrapper.template.html',
  'ace/ace',
  'beautifier/beautify-html'],
  function(BaseView, streamDataTemplate, streamDataWrapperTemplate, Ace) {
  "use strict";
  
  var format = require('beautifier/beautify-html');
  return BaseView.extend({
    
    el: "#stream",

    template: _.template(streamDataTemplate),

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
      this.dataStream = Ace.edit("dataStream");
      this.dataStream.setTheme("ace/theme/chrome");
      this.dataStream.getSession().setMode("ace/mode/javascript");

      var aceSession = this.dataStream.getSession();
      var count = aceSession.getLength();
      this.dataStream.gotoLine(count, aceSession.getLine(count-1).length, false);
      this.dataStream.insert("last line");
      this.dataStream.find("last");
      this.addlisteners(options);
      // this.model.connect();
    },

    addlisteners: function(options){
      var _this = this;

      this.model.on( "request:sent", function(data){
        var prefix = this.requestSentPrefix;
        if (typeof(prefix) == "function") {
          prefix = prefix(data);
        }
        this.appendData(data, {prefix: prefix});
      }.bind(this));

      this.model.on("request:finished", function(data){
        var prefix = this.responseReceivedPrefix;
        if (typeof(prefix) == "function") {
          prefix = prefix(data);
        }
        this.appendData(data, {prefix: prefix});
      }.bind(this));

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

      // if the user is already at  the bottom of the stream scroll to the bottom after appending the new content
      if(this.isAtBottom()){
        scollToBottom = true;
      }

      if(content){
        content = format.html_beautify(content);
        
        if(options.prefix){ 
          if(lastLine.number > 0)
            options.prefix = "\n\n" + options.prefix + "\n";
          else
            options.prefix = options.prefix + "\n";

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

    copy: function() {
      var stream = this.dataStream;
      var content = "";

      content = stream.getSelection();
      
      if(content.length === 0){
        content = stream.getValue();
      }

      this.model.sendToBackground({event: "copy:text", data: content});
    },

    toggleForSubbar: function(){
      this.$el.toggleClass("toolbar-expanded");
    }

  });
});
