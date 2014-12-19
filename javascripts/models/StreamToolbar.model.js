define(['BaseModel', 'BaseCollection', 'lib/utils'], function(BaseModel, BaseCollection, Utils) {
  "use strict";

  return BaseModel.extend({

    urlsCursor: 0,

    urls: null,
    
    initialize: function(){
      this.urls = new BaseCollection();
      this.listenTo(this.urls, "add", function(object){
        console.log("[PGD] toolbar add", object);
      });

      this.listenTo(this.urls, "change", function(object){
        console.log("[PGD] toolbar change", object);
      });

    }

  });

});