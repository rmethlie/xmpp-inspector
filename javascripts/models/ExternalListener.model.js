define(['backbone', 'lib/utils'], function(Backbone, Utils) {
  "use strict";

  return Backbone.Model.extend({
    defaults: {
      port: null,
      authorized: false
    },
    initialize: function( attributes, options ){
      console.info( "[ExternalListener] Initialized.", this.get("port"));
    }
  })

});