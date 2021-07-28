(function () {
	subscribeToEvents();

	/**
	 * Creates a tab with the given url.
	 * 
	 * If a tab with the same url is already opened, then focus on it.
	 * 
	 * @param {*} url URL.
	 */
	function focusOrCreateTab(url) {
		let windows = browser.tabs.query({});
	
		// Loops through all opened windows.
		windows.then(function (tabs) {
			let mainTab = null;
	
			// Loops through all opened tabs.
			for (let tab of tabs) {
				if (tab.url.replace("#", "") == url) {
					mainTab = tab;
					break;
				}
			}
	
			// If tab exists, then focus.
			if (mainTab != null) 
				browser.tabs.update(mainTab.id, { "active": true });
			// Else create new tab.
			else 
				browser.tabs.create({ "url": url, "active": true });
		},{});
	}
	
	/**
	 * Subscribes to events. 
	 */
	function subscribeToEvents() {
		// When addon icon is clicked (for example, on the toolbar).
		browser.browserAction.onClicked.addListener(function (tab) {
			//let url = browser.extension.getURL(".test/UnitTest/unit.html");
			let url = browser.extension.getURL("app.html");
			focusOrCreateTab(url);
		});
	}
})();