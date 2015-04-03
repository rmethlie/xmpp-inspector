define(['jquery','underscore','backbone'], function($,_,Backbone){

  return Backbone.Model.extend({
    defaults: {
      title: 'StreamShare Default',
      contexts: []
    },

    initialize: function(){
      this.id = 'generic-context-item';
      console.warn( '[DefaultContext] Initialized. Probably a bad thing if you see this...' );
    },

    getConfig: function(parentId){
      var
      config = {
        id: this.id,
        parentId: parentId,
        title: this.get('title'),
        contexts: this.get('contexts')
      };

      console.log( '[Context] Config.', config );
      return config;
    },

    onClicked: function(){
      console.warn( '[DefaultContext] onClick not implemented.');
    }

  });

});