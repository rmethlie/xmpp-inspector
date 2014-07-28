define(['codemirror/lib/codemirror'],
  function(CodeMirror) {
  "use strict";

  // var others = Array.prototype.slice.call(arguments, 1);
  // var n_others = others.length;

  function indexOf(string, pattern, from) {
    if (typeof pattern == "string") return string.indexOf(pattern, from);
    var m = pattern.exec(from ? string.slice(from) : string);
    return m ? m.index + from : -1;
  }

  var cm = null;
  var stateHistory = [];
  // ex of a multiplex mode config object
  // {open: "<<", close: ">>", mode: CodeMirror.getMode(config, "text/plain"), delimStyle: "delimit"}
  return {
      initMixedMode: function(cmInstance){
        cm = cmInstance;
      },

      startState: function() {
        return {
          outer: CodeMirror.startState(outer),
          innerActive: null,
          inner: null
        };
      },

      copyState: function(state) {
        return {
          outer: CodeMirror.copyState(outer, state.outer),
          innerActive: state.innerActive,
          inner: state.innerActive && CodeMirror.copyState(state.innerActive.mode, state.inner)
        };
      },

      setFormat: function(format) {
          var state = cm.getStateAfter();
          stateHistory.push(state);
          var other = {
            mode: CodeMirror.getMode(CodeMirror.defaults, "application/xml")
          }
          state.innerActive = other;
          state.inner = CodeMirror.startState(other.mode, state.indent ? state.indent(state.outer, "") : 0);
      },
      
      resetFormat: function() {
          currState = cm.getStateAfter();        
          currState.innerActive = currState.inner = null;
          lastState = stateHistory.pop();
          // state.inner = CodeMirror.startState(other.mode, outer.indent ? outer.indent(state.outer, "") : 0);
          // return other.delimStyle;
      },

      token: function(stream, state) {
        if (!state.innerActive) {
          var cutOff = Infinity, oldContent = stream.string;
          for (var i = 0; i < n_others; ++i) {
            var other = others[i];
            var found = indexOf(oldContent, other.open, stream.pos);
            if (found == stream.pos) {
              stream.match(other.open);
              state.innerActive = other;
              state.inner = CodeMirror.startState(other.mode, outer.indent ? outer.indent(state.outer, "") : 0);
              return other.delimStyle;
            } else if (found != -1 && found < cutOff) {
              cutOff = found;
            }
          }
          if (cutOff != Infinity) stream.string = oldContent.slice(0, cutOff);
          var outerToken = outer.token(stream, state.outer);
          if (cutOff != Infinity) stream.string = oldContent;
          return outerToken;
        } else {
          var curInner = state.innerActive, oldContent = stream.string;
          if (!curInner.close && stream.sol()) {
            state.innerActive = state.inner = null;
            return this.token(stream, state);
          }
          var found = curInner.close ? indexOf(oldContent, curInner.close, stream.pos) : -1;
          if (found == stream.pos) {
            stream.match(curInner.close);
            state.innerActive = state.inner = null;
            return curInner.delimStyle;
          }
          if (found > -1) stream.string = oldContent.slice(0, found);
          var innerToken = curInner.mode.token(stream, state.inner);
          if (found > -1) stream.string = oldContent;

          if (curInner.innerStyle) {
            if (innerToken) innerToken = innerToken + ' ' + curInner.innerStyle;
            else innerToken = curInner.innerStyle;
          }

          return innerToken;
        }
      },

      indent: function(state, textAfter) {
        var mode = state.innerActive ? state.innerActive.mode : outer;
        if (!mode.indent) return CodeMirror.Pass;
        return mode.indent(state.innerActive ? state.inner : state.outer, textAfter);
      },

      blankLine: function(state) {
        var mode = state.innerActive ? state.innerActive.mode : outer;
        if (mode.blankLine) {
          mode.blankLine(state.innerActive ? state.inner : state.outer);
        }
        if (!state.innerActive) {
          for (var i = 0; i < n_others; ++i) {
            var other = others[i];
            if (other.open === "\n") {
              state.innerActive = other;
              state.inner = CodeMirror.startState(other.mode, mode.indent ? mode.indent(state.outer, "") : 0);
            }
          }
        } else if (state.innerActive.close === "\n") {
          state.innerActive = state.inner = null;
        }
      },

    };
  }
);
