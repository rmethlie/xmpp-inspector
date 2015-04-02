define(['BaseView',
  'BaseCollection',
  'Streams',
  'text!templates/stream-data.template.html',
  'text!templates/stream-data-wrapper.template.html',
  'lib/codemirror-container',
  'lib/codemirror-searchable',
  'beautifier/beautify-html',
  'lib/utils'],
  function(BaseView, BaseCollection, Streams, streamDataTemplate, streamDataWrapperTemplate, CodeMirror, cmSearchable, format, Utils) {
  "use strict";

  return BaseView.extend({
    
    el: "#streams",

    requestSentPrefix: function(data){
      var output = "";
      var arrows = ">>>>>>>>>>>>>>>";
      output = "sent: " + data.url + " " + new Date().toTimeString() + " " + arrows;

      return output;
    },

    responseReceivedPrefix: function(data){
      var output = "";
      var arrows = "<<<<<<<<<<<<<<<";
      output = arrows + " received: " + data.url + " " + new Date().toTimeString();

      return output;
    },

    template: _.template(streamDataTemplate),

    dataStreamConfig: {
      mode: "streams",
      lineNumbers: true,
      lineWrapping: true,
      readOnly: true,
      theme: "streams default", // apply our modifications to the default CodeMirror theme.
      styleSelectedText: true,
      styleActiveLine: false,
      foldGutter: true,
      gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
    },

    // map the line number in the data stream to the networkEvent stored in the model
    eventsToLineMap: null,

    initialize: function(options){
      console.log("[StreamsView] initialize");
      
      if(!options)
        options = {};

      _.extend(this, cmSearchable);

      this.eventsToLineMap = new BaseCollection();

      var patterns = options.patterns || [];
      this.inspectorView = options.inspectorView;
      this.streams = new Streams(patterns);
      this.render();
      this.dataStream = CodeMirror.fromTextArea(document.getElementById("dataStream"), this.dataStreamConfig);
      this.initSearchable(this.dataStream);
      this.addlisteners(options);
    },
    
    addlisteners: function(options){
      var _this = this;

      this.listenTo(this.streams.networkEvents, "add", function(packet){
        var prefix,
            type = packet.get("type"),
            data = _.extend(
              {
                index   : this.streams.networkEvents.indexOf(packet),
                length  : this.streams.networkEvents.length
              },
              packet.toJSON()
            );
        if(type === "beforeRequest")
          prefix = this.requestSentPrefix;
        
        if(type === "requestFinished")
          prefix = this.responseReceivedPrefix;

        if (typeof(prefix) == "function") {
          prefix = prefix(data);
        }
        this.writeData(data, {prefix: prefix, format: data.format, url: data.url});
      }.bind(this));

      this.listenTo(this.inspectorView, "search:submit", function(options){
        this.$el.addClass("searching");
        var query = options.query;
        var reverse = options.reverse;
        if(this.getSearchState().query === query){
          if(reverse)
            this.findPrevious();
          else
            this.findNext();
        }else{
          this.clearSearch();
          this.find(query);
        }
      });

      this.listenTo(this.inspectorView, "search:cancel", function(){
        this.$el.removeClass("searching");
        this.clearSearch();
      });

    },

    render: function(){
      this.$el.html(this.template({}));
      return this;
    },

    isAtBottom: function(){
      var scrollInfo = this.dataStream.getScrollInfo();
      var offsetFromBottom = Math.abs(
        (scrollInfo.clientHeight + scrollInfo.top) - scrollInfo.height
      );
      if(offsetFromBottom <= 35) // this is equal to ~2 lines
        return true;
      else
        return false;
      
    },

    isMostRecentEvent: function(data){
      return data.index === data.length - 1;
    },

    getLine: function(num){
      if(typeof num === 'undefined')
        return null;
      
      var handle = this.dataStream.getLineHandle(num);
      // this.dataStream.getLineNumber returns the current 
      // position of that line (or null when it is no longer 
      // in the document).
      return {
        number    : this.dataStream.getLineNumber(handle),
        handler   : handle,
        charCount : handle.text.length
      };
    },
    
    getLineLength: function(num){
      return this.getLine(num).charCount;
    },

    getInsertLineInfo: function(data, options){
      var mapEntry, lineInfo;
      if(this.isMostRecentEvent(data))
        return this.getLastLineInfo();
      
      mapEntry = this.eventsToLineMap.at(data.index);

      if (mapEntry){
        lineInfo = this.getLine(mapEntry.get("number"));
        return {
          number    : lineInfo.number,
          handler   : lineInfo.handler,
          charCount : lineInfo.handler.text.length
        };
      } else{
        return {
          number    : 0,
          handler   : null,
          charCount : 0
        };
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

    writeData: function(data, options){
      console.log("[Streams.view] writeData", data);
      if(!options)
        options = {};
      var writeResults,
          content = data.body,
          url = options.url,
          scrollToBottom = false;

      // if the user is already at  the bottom of the stream scroll to the bottom after appending the new content
      if(this.isAtBottom()){
        scrollToBottom = true;
      }

      if(data.body){
        writeResults = this.writeDataContents(data, options);
        this.updateNetworkEventsMap(writeResults);
      }

      if(scrollToBottom === true){
        this.dataStream.scrollIntoView({line: this.dataStream.lastLine(), ch: 1});
      }
    },

    updateNetworkEventsMap: function(writeData){
      this.eventsToLineMap.add(writeData, {at: writeData.eventIndex});
      var models = this.eventsToLineMap.models,
          modelCount = models.length,
          startingLine;

      for(var i = writeData.eventIndex + 1; i < modelCount ; i++){
        startingLine = models[i].get("number");
        models[i].set("number", startingLine + writeData.contentLineCount);
        models[i].set("eventIndex",  models[i].get("eventIndex") + 1);
        models[i].set("handler",  this.getLine(startingLine));
      }

    },

    writeDataContents: function(data, options){
      var content, prefixInfo, contentLineCount, lineInfo = this.getInsertLineInfo(data, options);
        
      prefixInfo = this.writeDataPrefix(data, lineInfo, options);      
      content = this.format(data.body, options.url, options) + "\n\n";
      
      this.dataStream.replaceRange(content, {line: prefixInfo.endingLineNumber + 1, ch: 0});
      contentLineCount = prefixInfo.lineCount + content.split("\n").length;
      
      return _.extend({
          // startingLine: lineInfo.number, 
          eventIndex: data.index, 
          contentLineCount: contentLineCount
        }, 
        {number: lineInfo.number}
      );
    },

    writeDataPrefix: function(data, lineInfo, options){
      var lineCount, 
          startingLine,
          startingLineLength,
          endingLine,
          prefix = options.prefix || "";
          
      prefix = prefix + "\n";

      lineCount = prefix.split("\n").length - 1
      startingLine = lineInfo.number;
      startingLineLength = lineInfo.charCount
      // the content always ends with a blank line "\n"
      // this increase the number of reported lines by one
      endingLine = startingLine + lineCount - 1;

      var markFrom = {line: startingLine, ch: 0};
      this.dataStream.replaceRange(prefix, {line: startingLine, ch: 0});
      lineInfo = this.getLine(endingLine);
      var markTo = {line: endingLine, ch: this.getLineLength(endingLine)};

      this.dataStream.markText(markFrom, markTo, {className: "prefix direction"});

      return {
        startingLineNumber: startingLine,
        endingLineNumber: endingLine,
        lineCount: lineCount
      };

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

    toggleForSubbar: function(state){

      switch(state){
        case "show":
          this.$el.addClass("toolbar-expanded");
          break;
        case "hide":
          this.$el.removeClass("toolbar-expanded");
          break;
        default:
          this.$el.toggleClass("toolbar-expanded");
      }
    },

    update: function(attributes){
      this.streams.sendToBackground(attributes);
    },

    getSources: function(){
      return this.streams;
    },

    format: function(content, url, options){
      if(!options.format)
        options.format = "text";

      var mode = options.format.toLowerCase();
      switch(mode){
        case "text":
          break;
        case "xml":
          content = this.formatAsXML(content);
          break;
        case "json":
          content = this.formatAsJSON(content);
          break;
        default:
          console.warn(options.format, "not a recognized format");
      }
      
      var startModeDelimiter = "start:" + mode  + " ";
      var endModeDelimiter = "end:" + mode  + " ";
      
      content = startModeDelimiter + "\n" + content + "\n" + endModeDelimiter + "\n";

      return content;
    },

    formatAsXML: function(content){
      return format.html_beautify(content);
    },

    formatAsJSON: function(content){
      try{
        content = JSON.stringify(JSON.parse(content), null, "    ");
      } catch(e){
        console.warn("Could not parse as JSON");
      }
      return content;
    }

  });
});
