define(['BaseModel', 'lib/utils'], function(BaseModel, Utils) {
  "use strict";

  return BaseModel.extend({
    
    defaults : Utils.defaultListenerAttributes,

    initialize: function(){

    }

  });

});