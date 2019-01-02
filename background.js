
function focusOrCreateTab(url) {
	var windows = browser.tabs.query({}); 
	windows.then( function(tabs) {
	var existing_tab = null;
	for (let tab of tabs) {
		  console.log(tab.url.replace("#",""));
		if (tab.url.replace("#","") == url) {
		  existing_tab = tab;
		  break;
		}
	}
    
    if (existing_tab != null) {
		browser.tabs.update(existing_tab.id, {"active":true});
    } else {
		
		browser.tabs.create({"url":url, "active":true});
    } 
	}, 
	{});
}

browser.browserAction.onClicked.addListener(function(tab) {
  var manager_url = browser.extension.getURL("index.html");

  focusOrCreateTab(manager_url);
});