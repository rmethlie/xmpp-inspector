define(['../codemirror/mode/xml/xml.js'], function(CodeMirror) {
  "use strict";

  return function(){
    console.log('this is from my generic module');
    var CM = require('../codemirror/lib/codemirror.js');
    var editor = CM.fromTextArea(document.getElementById("code"), {
        mode: "text/html",
        lineNumbers: true
      });
  };
});
