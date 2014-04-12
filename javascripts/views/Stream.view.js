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
      theme: "xmpp default", // apply our modifications to the default CodeMirror theme.
      viewportMargin: 10 
        // viewportMargin is the CodeMirror render buffer size (number of non-visible lines rendered by the viewport). 
        // Setting it explicitly so we can calculate the last visible line in stream
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

      this.listenTo(this.model, "request:finished", function(packet, content){
        this.appendData(content, {prefix: this.responseReceivedPrefix});
      });

      // update property when we are at the bottom of the editor
      var scrollElement = this.dataStream.getScrollerElement();
      $(scrollElement).bind('scroll', function(e) {
          var elem = $(e.currentTarget);
          if (elem[0].scrollHeight - elem.scrollTop() == elem.outerHeight()) {
            console.log("bottom");
            this.atBottom = true;
          }else{
            console.log("not bottom");
            this.atBottom = false;
          }
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
      var atBottom = false;
      
    },

    appendData: function(content, options){
      if(!options)
        options = {}
      // note: .getViewport() may include the offscreen buffered lines. this is how we test to see if we are at the end of the viewport
      var lastViewportLine = this.dataStream.getViewport().to; 
      var lastLineNumber = this.dataStream.lastLine();
      var lastLineHandler = this.dataStream.getLineHandle(lastLineNumber);
      var lastLineCharCount = lastLineHandler.text.length;
      var cursorOptions = {scroll: false};
      if(this.atBottom)
         cursorOptions = {scroll: true};

      // move the cursor to the last char of the last line
      this.dataStream.setCursor(lastLineNumber, lastLineCharCount, cursorOptions);
      this.dataStream.execCommand('goLineEnd');
      this.dataStream.execCommand('newlineAndIndent');
      this.dataStream.setCursor(lastLineNumber, lastLineCharCount, cursorOptions);
      this.dataStream.execCommand('goLineEnd');
      
      if(options.prefix)
        content = options.prefix + content;
      
      // insert content
      this.dataStream.replaceRange(format.html_beautify(content), {line: Infinity});

    }

  });
});
