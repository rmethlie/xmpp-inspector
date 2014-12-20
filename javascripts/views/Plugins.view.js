define([
  "BaseView",
  "collections/Plugins.collection",
  "text!templates/plugins.template.html"
  ],
  function( BaseView, Plugins, pluginTemplate) {

  "use strict";

  return BaseView.extend({

    el: "#plugin-menu",

    toolbar: null,

    plugins: null,

    template: _.template(pluginTemplate),

    initialize: function(){
      console.log("[PluginsView] initialize");
    },

    render: function(options){
      this.$el.html("Plugins rendered");
    },

    addListeners: function(){

    },

  });
});
