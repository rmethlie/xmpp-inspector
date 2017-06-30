define(['jquery','underscore','backbone', 'Context'], function($,_,Backbone, Context){

  return Context.extend({
    defaults: {
      title: 'Page',
      contexts: ['page']
    },

    initialize: function(){
      console.log( '[PageContext] Initialized.' );
    },

    onClick: function( clickEvent, tab ){
      console.log( '[PageContext] Click event' );
    }
  });

});