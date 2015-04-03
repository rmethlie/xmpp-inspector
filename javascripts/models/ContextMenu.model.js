define([
  'jquery',
  'underscore',
  'backbone',
  'StreamShareContext'
], function($,_,Backbone, 
  StreamShareContext
){

  return Backbone.Model.extend({
    defaults: {
    },

    initialize: function( attributes, options ){

      /***
        for now there is only one top-level context, 
        with subcontext handlers based on content type
        
        but in the future we may want to have other top-level
        menus like 'account' access, 'extension' options, 'console'
        integration, etc.
      ++*/
      var
      streamShareContext = new StreamShareContext();

      console.log('[ContextMenu] Initialized.');
    },

    requestSentPrefix: function(){ 
      return "<!-- sent " + new Date().toTimeString() + "  >>>>>>>>>>>> -->";
    },

    responseReceivedPrefix: function(){ 
      return "<!-- <<<<<<<<<<<< received " + new Date().toTimeString() + " -->";
    },

    getPrefix: function(packet){
      switch( this.get('type') ){
        case 'beforeRequest':
          return this.requestSentPrefix();
          break;

        case 'requestFinished':
          return this.responseReceivedPrefix();
          break;

        default:
          return '<!-- ??? unknown packet type ??? -->';
          break;
      }
    }
  });
})


