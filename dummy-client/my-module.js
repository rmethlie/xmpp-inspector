define(['../codemirror/mode/xml/xml.js', 'jsBeautifier/beautify-html'], function(CodeMirror) {
  "use strict";

  var format = require('jsBeautifier/beautify-html');
  return function(){
    console.log('this is from my generic module');
    // var test = '&lt;html style="color: green"&gt;&lt;!-- this is a comment --&gt;&lt;head&gt;&lt;title&gt;HTML Example&lt;/title&gt;&lt;/head&gt;&lt;body&gt;The indentation tries to be &lt;em&gt;somewhat &quot;do what I mean&quot;&lt;/em&gt;... but might not match your style.  &lt;/body&gt;&lt;/html&gt;'
    // var test = '<html style="color: green"><!-- this is a comment --><head><title>HTML Example</title></head><body>The indentation tries to be <em>somewhat 'do what I mean'</em>... but might not match your style.  </body></html>'
    var test = '<x><y>z</y></x>';
    // var test = '&lt;x&gt;&lt;y&gt;z&lt;/y&gt;&lt;/x&gt;';

    document.getElementById("code").innerHTML = format.html_beautify(test);
    var CM = require('../codemirror/lib/codemirror.js');
    var editor = CM.fromTextArea(document.getElementById("code"), {
        mode: "text/html",
        lineNumbers: true
      });
    console.log('done');
  };
});
