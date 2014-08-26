define(['BaseModel', 'BaseCollection', 'lib/utils'], function(BaseModel, BaseCollection, Utils) {
  "use strict";

  return BaseModel.extend({
    
    // defaults : Utils.defaultListenerAttributes,

    urlsCursor: 0,

    urls: new BaseCollection(),
    
    initialize: function(){

    }

  });

});