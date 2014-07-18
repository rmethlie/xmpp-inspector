
chrome.devtools.panels.create(
  "XMPP",
  null,
  "panel.html",
  function(extensionPanel){
    extensionPanel.onSearch.addListener(function(){
      console.log(arguments);
    })
  }
);


