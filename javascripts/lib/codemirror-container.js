define([
  'codemirror/lib/codemirror',
  'codemirror/mode/xml/xml',
  'codemirror/mode/javascript/javascript',
  'codemirror/addon/mode/multiplex',
  'codemirror/addon/selection/mark-selection',
  'codemirror/addon/selection/active-line',
  'codemirror/addon/search/searchcursor'
  ],
  function(CodeMirror) {
  "use strict";

  CodeMirror.defineMode("http-stream", function(config) {
      return CodeMirror.multiplexingMode(
        CodeMirror.getMode(config, "text/plain"),
        {
          open: "xml:start", 
          close: "xml:end",
          mode: CodeMirror.getMode(CodeMirror.defaults, "text/html"),
          delimStyle: "delimit"
        },
        {
          open: "json:start", 
          close: "json:end",
          mode: CodeMirror.getMode(CodeMirror.defaults, "javascript"),
          delimStyle: "delimit"
        }
        // .. more multiplexed styles can follow here
      );
    });

  return CodeMirror;
});
