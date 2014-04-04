require.config({
  paths: {
    CodeMirror: "../codemirror/lib/codemirror",
    MyModule: "../my-module",
  }
});
require(['MyModule'], function(module) {
    module();
    // var myCodeMirror = CM(document.body, {
    //       value: "function myScript(){return 100;}\n",
    //       mode:  "text/html"
    //     });
    // var myCodeMirror = CodeMirror.fromTextArea(document.querySelector("#code"));
    //  CodeMirrorXML: "/codemirror/mode/xml/xml"
    // var xml = require("/codemirror/mode/xml/xml");
});
/*
*/