// ExternalRegistrar
define([
],function(){

  var
  _instance_ = Backbone.Collection.extend({
    initialize: function(){
      console.log( '[ExternalRegistrar] Initialized.');
    },

    register: function( listener ){

    }
  });

  // singleton.
  return new _instance_;

})