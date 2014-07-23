define(['BaseView',
  'text!templates/stream-data.template.html',
  'text!templates/stream-data-wrapper.template.html',
  'lib/stream-container',
  'beautifier/beautify-html'],
  function(BaseView, streamDataTemplate, streamDataWrapperTemplate, CodeMirror, format) {
  "use strict";
  
  
  function SearchState() {
    this.posFrom = this.posTo = this.query = null;
    this.overlay = null;
  }

  function queryCaseInsensitive(query) {
    return typeof query == "string" && query == query.toLowerCase();
  }

  function searchOverlay(query, caseInsensitive) {
    var startChar;
    if (typeof query == "string") {
      startChar = query.charAt(0);
      query = new RegExp("^" + query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),
                         caseInsensitive ? "i" : "");
    } else {
      query = new RegExp("^(?:" + query.source + ")", query.ignoreCase ? "i" : "");
    }
    return {token: function(stream) {
      if (stream.match(query)) return "searching";
      while (!stream.eol()) {
        stream.next();
        if (startChar && !caseInsensitive)
          stream.skipTo(startChar) || stream.skipToEnd();
        if (stream.match(query, false)) break;
      }
    }};
  }

  function getSearchCursor(cm, query, pos) {
    // Heuristic: if the query string is all lowercase, do a case insensitive search.
    return cm.getSearchCursor(query, pos, queryCaseInsensitive(query));
  };

  function parseQuery(query) {
    var isRE = query.match(/^\/(.*)\/([a-z]*)$/);
    if (isRE) {
      query = new RegExp(isRE[1], isRE[2].indexOf("i") == -1 ? "" : "i");
      if (query.test("")) query = /x^/;
    } else if (query == "") {
      query = /x^/;
    }
    return query;
  }

  return BaseView.extend({
    
    el: "#stream",

    template: _.template(streamDataTemplate),

    dataStreamConfig: {
      mode: "text/html",
      lineNumbers: true,
      lineWrapping: true,
      readOnly: true,
      theme: "xmpp default", // apply our modifications to the default CodeMirror theme.
      styleSelectedText: true
    },

    // map the line number in the data stream to the networkEvent stored in the model
    networkEventMap: {},

    initialize: function(options){
      console.log("[StreamView] initialize");
      
      if(!options)
        options = {};
      
      this.inspectorView = options.inspectorView;
      this.render();
      this.dataStream = CodeMirror.fromTextArea(document.getElementById("dataStream"), this.dataStreamConfig);
      this.addlisteners(options);
    },
    
    find: function(query, rev){
      var _this = this;
      var cm = this.dataStream;
      var state = this.getSearchState();
      if (state.query) return this.findNext(cm, rev);
      cm.operation( function() {
        if (!query || state.query) return;
        state.query = parseQuery(query);
        cm.removeOverlay(state.overlay, queryCaseInsensitive(state.query));
        state.overlay = searchOverlay(state.query, queryCaseInsensitive(state.query));
        cm.addOverlay(state.overlay);
        state.posFrom = state.posTo = cm.getCursor();
        _this.findNext(cm, rev);
      });
    },

    findPrevious: function() {
      this.find(this.dataStream, true);
    },
    
    findNext: function(cm, rev) {
      var _this = this;
      cm = this.dataStream;

      cm.operation(function() {
        var state = _this.getSearchState(cm);
        var cursor = getSearchCursor(cm, state.query, rev ? state.posFrom : state.posTo);
        if (!cursor.find(rev)) {
          cursor = getSearchCursor(cm, state.query, rev ? CodeMirror.Pos(cm.lastLine()) : CodeMirror.Pos(cm.firstLine(), 0));
          if (!cursor.find(rev)) return;
        }
        cm.setSelection(cursor.from(), cursor.to());
        cm.scrollIntoView({from: cursor.from(), to: cursor.to()});
        state.posFrom = cursor.from(); state.posTo = cursor.to();
      });
    },

    clearSearch: function () {
      var cm = this.dataStream;
      cm.operation(function() {
        var state = this.getSearchState(cm);
        if (!state.query) return;
        state.query = null;
        cm.removeOverlay(state.overlay);
      }.bind(this));
    }, 

    getSearchState: function () {
      return this.dataStream.state.search || (this.dataStream.state.search = new SearchState());
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
    }

  });
});
