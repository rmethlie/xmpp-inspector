define(['jquery','underscore','backbone', 'Context'], function($,_,Backbone, Context){

  return Context.extend({
    defaults: {
      title: 'Link',
      contexts: ['link']
    },

    initialize: function(){
      console.log( '[LinkContext] Initialized.');
    },

    onClick: function( clickEvent, tab ){
      console.log( '[LinkContext] Click event' );
    }
  });

});