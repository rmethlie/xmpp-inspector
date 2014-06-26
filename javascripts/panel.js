
require(["config"], function() {
require(["app",
    "InspectorView",'Bridge'], function(app, InspectorView, Bridge) {
      var inspectorView = new InspectorView({
        model: new Bridge({
          // no defaults
        },{
          env: "panel"
        })
      });
  });
});
