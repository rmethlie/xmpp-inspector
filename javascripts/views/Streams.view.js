define(['BaseView',
  'Streams',
  'text!templates/stream-data.template.html',
  'text!templates/stream-data-wrapper.template.html',
  'lib/codemirror-container',
  'lib/codemirror-searchable',
  'beautifier/beautify-html',
  'lib/utils'],
  function(BaseView, Streams, streamDataTemplate, streamDataWrapperTemplate, CodeMirror, cmSearchable, format, Utils) {
  "use strict";

  return BaseView.extend({
    
    el: "#streams",

    requestSentPrefix       : function(data){
      var output = "";
      var arrows = ">>>>>>>>>>>>>>>";
      output = "sent: " + data.url + " " + new Date().toTimeString() + " " + arrows;

      return output;
    },

    responseReceivedPrefix  : function(data){
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
      styleActiveLine: false
    },

    // map the line number in the data stream to the networkEvent stored in the model
    networkEventMap: {},

    initialize: function(options){
      console.log("[StreamsView] initialize");
      
      if(!options)
        options = {};

      _.extend(this, cmSearchable);

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

      this.listenTo(this.streams, "request:sent", function(data){
        var prefix = this.requestSentPrefix;
        if (typeof(prefix) == "function") {
          prefix = prefix(data);
        }
        this.appendData(data, {prefix: prefix, format: data.format, url: data.url});
      }.bind(this));

      this.listenTo(this.streams, "request:finished", function(data){
        var prefix = this.responseReceivedPrefix;
        var guid = Utils.guidGen();

        if (typeof(prefix) == "function") {
          prefix = prefix({
            id: guid,
            body: data.body,
            format: data.format,
            url: data.data.request.url
          });
        }
        this.appendData(data, {prefix: prefix, format: data.format, url: data.data.request.url });
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
        options = {};
      var content = data.body;
      var url = options.url;
      var scollToBottom = false;
      var lastLine = this.getLastLineInfo();

      // if the user is already at  the bottom of the stream scroll to the bottom after appending the new content
      if(this.isAtBottom()){
        scollToBottom = true;
      }

      if(content){
        var prefix = options.prefix;
        
        if(prefix){
          if(this.getLastLineInfo().number > 0)
            prefix = "\n\n" +  prefix + "\n";
          else
            prefix = prefix + "\n";

          var markFrom = {line: lastLine.number, ch: lastLine.charCount};
          this.dataStream.replaceRange(prefix, {line: Infinity, ch: lastLine.charCount});
          lastLine = this.getLastLineInfo();
          var markTo = {line: lastLine.number, ch: lastLine.charCount};

          this.dataStream.markText( markFrom, markTo, {className: "prefix direction"});
        }


        content = this.format(content, url, options);

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

    addSource: function(params){
      if(!params)
        params = {};

      this.streams.add(params);
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
        content = JSON.stringify(JSON.parse(content));
      } catch(e){
        console.warn("Could not parse as JSON");
      }
      return content;
    }
  });
});
