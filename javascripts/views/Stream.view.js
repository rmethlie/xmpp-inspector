define(['BaseView', 
  'text!templates/stream-data.template.html', 
  'text!templates/stream-data-wrapper.template.html',
  'codemirror/mode/xml/xml',
  'beautifier/beautify-html'], 
  function(BaseView, streamDataTemplate, streamDataWrapperTemplate) {
  "use strict";
  
  // var CodeMirrorModeXML = require('/javascripts/bower_components/codemirror/mode/xml/xml.js');

  var format = require('beautifier/beautify-html');
  return BaseView.extend({
    
    el: "#stream",

    template: _.template(streamDataTemplate),
    
    listener: null,

    dataStreamConfig: {
      mode: "text/html",
      lineNumbers: true,
      viewportMargin: 10, // CodeMirror render buffer size. Set explicitly so we can calculate the last visible line in stream
      lineWrapping: true
    }, 

    initialize: function(options){
      console.log("[StreamView] initialize");
      this.render();
      var CodeMirror = require('codemirror/lib/codemirror');

      this.listener = options.listener;

      this.dataStream = CodeMirror.fromTextArea(document.getElementById("dataStream"), this.dataStreamConfig);

      this.listenTo(this.listener, "request:finished", function(packet, contents){
        this.appendData(contents);
      });

    },
    render: function(){
      this.$el.html(this.template({}));
    },

    guidGen: function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    },

    appendData: function(contents){
      // note: .getViewport() may include the offscreen buffered lines. this is how we test to see if we are at the end of the viewport
      var lastViewportLine = this.dataStream.getViewport().to; 
      var lastLineNumber = this.dataStream.lastLine();
      var lastLineHandler = this.dataStream.getLineHandle(lastLineNumber);
      var lastLineCharCount = lastLineHandler.text.length;
      var cursorOptions = {scroll: false};
      if(lastLineNumber + 1 === lastViewportLine )
         cursorOptions = {scroll: true};

      // move the cursor to the last char of the last line
      this.dataStream.setCursor(lastLineNumber, lastLineCharCount, cursorOptions);
      this.dataStream.execCommand('goLineEnd');
      this.dataStream.execCommand('newlineAndIndent');
      this.dataStream.setCursor(lastLineNumber, lastLineCharCount, cursorOptions);
      this.dataStream.execCommand('goLineEnd');
      
      // insert content
      this.dataStream.replaceRange(format.html_beautify(contents), {line: Infinity});



      // auto scroll

    }

  });
});
