
chrome.devtools.panels.create(
  "Streams",
  null,
  "panel.html",
  function(extensionPanel){
    extensionPanel.onSearch.addListener(function(){
      console.log(arguments);
    })
  }
);


