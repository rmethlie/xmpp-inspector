define(['Stream',
  'FilterIQ',
  'FilterPresence',
  'FilterMessage',
  'FilterRoster',
  ], function(
    Stream,
    FilterIQ,
    FilterPresence,
    FilterMessage,
    FilterRoster ) {
  "use strict";

  return Stream.extend({

    initialize: function(options){
      console.log("[XMPPStream] initialize");
      this.constructor.prototype.__proto__.initialize.apply(this, arguments);
    },

    addFilters: function(){

    },    

  });
});
