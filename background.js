
function focusOrCreateTab(url) {
  browser.windows.getAll({"populate":true}, function(windows) {
    var existing_tab = null;
    for (var i in windows) {
      var tabs = windows[i].tabs;
      for (var j in tabs) {
        var tab = tabs[j];
        if (tab.url.replace("#","") == url) {
          existing_tab = tab;
          break;
        }
      }
    }
    if (existing_tab) {
		browser.tabs.update(existing_tab.id, {"active":true});
    } else {
		
		browser.tabs.create({"url":url, "active":true});
    }
  });
}

browser.browserAction.onClicked.addListener(function(tab) {
  var manager_url = browser.extension.getURL("index.html");
  focusOrCreateTab(manager_url);
});