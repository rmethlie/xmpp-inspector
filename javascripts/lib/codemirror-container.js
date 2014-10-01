define([
  'codemirror/lib/codemirror',
  'codemirror/addon/mode/multiplex',
  'codemirror/addon/fold/foldcode',
  'codemirror/addon/fold/foldgutter',
  'codemirror/addon/fold/xml-fold',
  'codemirror/addon/fold/indent-fold',
  'codemirror/mode/xml/xml',
  'codemirror/mode/javascript/javascript',
  'codemirror/addon/selection/mark-selection',
  'codemirror/addon/selection/active-line',
  'codemirror/addon/search/searchcursor'
  ],
  function(CodeMirror) {
  "use strict";
  CodeMirror.defineMode("streams", function(config) {
    return CodeMirror.multiplexingMode(
      CodeMirror.getMode(config, "text/plain"),
      {
        open        : "start:xml",
        close       : "end:xml",
        mode        : CodeMirror.getMode(config, "text/html"),
        delimStyle  : "delimit",
        innerStyle  : "mode-xml"
      },
      {
        open        : "start:json",
        close       : "end:json",
        mode        : CodeMirror.getMode(config, "application/json"),
        delimStyle  : "delimit",
        innerStyle  : "mode-json"
      }
      // .. more multiplexed styles can follow here
    );
  });

  return CodeMirror;
});
