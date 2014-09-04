define(['BaseView',
  'Streams',
  'text!templates/stream-data.template.html',
  'text!templates/stream-data-wrapper.template.html',
  'lib/codemirror-container',
  'lib/codemirror-searchable',
  'beautifier/beautify-html'],
  function(BaseView, Streams, streamDataTemplate, streamDataWrapperTemplate, CodeMirror, cmSearchable, format) {
  "use strict";

  return BaseView.extend({
    
    el: "#streams",

    template: _.template(streamDataTemplate),

    dataStreamConfig: {
      mode: "text/html",
      lineNumbers: true,
      lineWrapping: true,
      readOnly: true,
      theme: "xmpp default", // apply our modifications to the default CodeMirror theme.
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

      this.inspectorView = options.inspectorView;
      this.streams = new Streams();
      this.render();
      this.dataStream = CodeMirror.fromTextArea(document.getElementById("dataStream"), this.dataStreamConfig);
      this.initSearchable(this.dataStream);
      this.addlisteners(options);
    },
    
    addlisteners: function(options){
      var _this = this;

      this.streams.on( "request:sent", function(data){
        var prefix = this.requestSentPrefix;
        if (typeof(prefix) == "function") {
          prefix = prefix(data);
        }
        this.appendData(data, {prefix: prefix});
      }.bind(this));

      this.streams.on("request:finished", function(data){
        var prefix = this.responseReceivedPrefix;
        if (typeof(prefix) == "function") {
          prefix = prefix(data);
        }
        this.appendData(data, {prefix: prefix});
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
      this.streams.updateStream(attributes);
    },

    getSources: function(){
      return this.model;
    },
  });
});
