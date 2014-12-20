define([
  "BaseView",
  "collections/Plugins.collection",
  "text!templates/plugins.template.html"
  ],
  function( BaseView, InspectorModel, ResponseListener, StreamsView, StreamToolbarView,
    Streams, StreamsManager, inspectorTemplate, Utils ) {

  "use strict";

  return BaseView.extend({

    el: ".button .plugins li",

    toolbar: null,

    plugins: null,

    template: _.template(inspectorTemplate),

    initialize: function(){
      console.log("[PluginsView] initialize");

    },

    render: function(options){

    },

    addListeners: function(){

    },

  });
});
