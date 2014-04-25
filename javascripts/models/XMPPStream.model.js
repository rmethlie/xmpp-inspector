define(['Stream'], function(Stream) {
  "use strict";

  return Stream.extend({

    initialize: function(options){
      console.log("[XMPPStream] initialize");
      this.constructor.prototype.__proto__.initialize.apply(this, options);
    },    

  });
});
