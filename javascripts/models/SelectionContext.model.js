define(['jquery','underscore','backbone', 'Context'], function($,_,Backbone, Context){

  return Context.extend({
    defaults: {
      title: 'Selection',
      contexts: ['selection']
    },

    initialize: function(){
      console.log( '[SelectionContext] Initialized.');
    },

    onClick: function( clickEvent, tab ){
      console.log( '[SelectionContext] Click event.' );
    }
  });

});