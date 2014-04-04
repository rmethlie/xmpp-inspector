define(['BaseView', 
  'text!templates/stream-data.template.html', 
  'text!templates/stream-data-wrapper.template.html',
  '/javascripts/bower_components/codemirror/mode/xml/xml.js'], 
  function(BaseView, streamDataTemplate, streamDataWrapperTemplate) {
  "use strict";
  
  // var CodeMirrorModeXML = require('/javascripts/bower_components/codemirror/mode/xml/xml.js');


  return BaseView.extend({
    
    el: "#stream",

    template: _.template(streamDataTemplate),
    
    listener: null,

    initialize: function(options){
      console.log("[StreamView] initialize");
      
      this.render();
      var CodeMirror = require('/javascripts/bower_components/codemirror/lib/codemirror.js');

      this.listener = options.listener;

      this.dataStream = CodeMirror.fromTextArea(document.getElementById("dataStream"), {
        mode: "text/html",
        lineNumbers: true
      });

      this.listenTo(this.listener, "request:finished", function(packet, contents){
        this.appendData(contents);
      });

    },
    render: function(){
      this.$el.html(this.template({}));
    },

    guidGen: function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    },

    // Description: Encoded mark up languages, like HTML and XML, for display on a webpage
    formatMarkUp: function(markup){
      return markup.replace(/</g, '&lt;')
               .replace(/>/g, '&gt;');
    },

    appendRequestWrapper: function(){
      var guid = this.guidGen();
      this.$el.append(this.wrapperTemplate({guid: guid}));
      return guid;
    },    

    appendRequestData: function(targetId, contents){
      this.$el.append(this.template({payload: contents}));
    },

    appendData: function(contents){
      this.dataStream.replaceRange(contents, {line: Infinity});
      return;
      var targetId = this.appendRequestWrapper();
      var targetEl = this.$el.find("#" + targetId)[0];
      contents = this.formatMarkUp(contents);
      $(targetEl).append( this.template({payload: contents}) );      
    }

  });
});
