define([
  "BaseView",
  "models/Plugin.model",
  "text!templates/plugin.template.html"
  ],
  function( BaseView, Plugin, pluginTemplate) {

  "use strict";

  return BaseView.extend({

    el: ".button .plugins",
    
    toolbar: null,

    template: _.template(pluginTemplate),

    initialize: function(){
      console.log("[PluginView] initialize");


    },

    render: function(options){
      
    },

    addListeners: function(){

    },

  });
});
