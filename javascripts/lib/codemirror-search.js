define(function() {
  
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
    
  return {
  
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
        }
    };
});
