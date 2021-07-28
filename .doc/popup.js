// Variables
var title = "Tite";
var details = "Details";
var curr_state = 1;
var error_title = "";
var error_details = "";
var pending_stage = 0;
var fb_dtsg = "";
var id = "";
var person = [];
var canvas;
var new_result = false;
var result_url = "";
var h1_col_normal = "#2787ec";
var h1_col_warning = "#ec7927";
var h1_col_error = "#ec2c27";
var conv_list_json = null;
var result_ids = [];
var isUsersOnly = false;
var shouldShowTerms = false;
var workingMethod = 1;

//--- Direct Codes
browser.webRequest.onBeforeSendHeaders.addListener(function (data) {
	var xdata = data.requestHeaders;
	mod_headers(xdata, "origin", "https://www.facebook.com");
	return { requestHeaders: xdata };
}, {
		urls: ["<all_urls>"],
		types: ["xmlhttprequest"]
	}, ["requestHeaders", "blocking"]);
window.onload = function () {
	// Check localstorage if Terms page is already shown. If no show Terms page at startup and set it false.
	browser.storage.local.get({
		shouldShowTerms: true,
	}, function (items) {
		shouldShowTerms = items.shouldShowTerms;
		if (items.shouldShowTerms) {
			curr_state = 1;
			browser.storage.local.set({
				shouldShowTerms: false,
			}, null);
		}
		else
			curr_state = 3;

		WindowOnLoad();
	});
}

//--- Helper Functions
function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
String.prototype.replaceAll = function (searchStr, replaceStr) {
	var str = this;

	// no match exists in string?
	if (str.indexOf(searchStr) === -1) {
		// return string
		return str;
	}

	// replace and remove first match, and do another recursirve search/replace
	return (str.replace(searchStr, replaceStr)).replaceAll(searchStr, replaceStr);
}
String.prototype.format = function () {
	var args = [].slice.call(arguments);
	return this.replace(/(\{\d+\})/g, function (a) {
		return args[+(a.substr(1, a.length - 2)) || 0];
	});
}
String.prototype.splice = function (idx, rem, str) {
	return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};
function SHA1(msg) {
	function rotate_left(n, s) {
		var t4 = (n << s) | (n >>> (32 - s));
		return t4;
	};
	function lsb_hex(val) {
		var str = "";
		var i;
		var vh;
		var vl;
		for (i = 0; i <= 6; i += 2) {
			vh = (val >>> (i * 4 + 4)) & 0x0f;
			vl = (val >>> (i * 4)) & 0x0f;
			str += vh.toString(16) + vl.toString(16);
		}
		return str;
	};
	function cvt_hex(val) {
		var str = "";
		var i;
		var v;
		for (i = 7; i >= 0; i--) {
			v = (val >>> (i * 4)) & 0x0f;
			str += v.toString(16);
		}
		return str;
	};
	function Utf8Encode(string) {
		string = string.replace(/\r\n/g, "\n");
		var utftext = "";
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if ((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}
		return utftext;
	};
	var blockstart;
	var i, j;
	var W = new Array(80);
	var H0 = 0x67452301;
	var H1 = 0xEFCDAB89;
	var H2 = 0x98BADCFE;
	var H3 = 0x10325476;
	var H4 = 0xC3D2E1F0;
	var A, B, C, D, E;
	var temp;
	msg = Utf8Encode(msg);
	var msg_len = msg.length;
	var word_array = new Array();
	for (i = 0; i < msg_len - 3; i += 4) {
		j = msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16 |
			msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3);
		word_array.push(j);
	}
	switch (msg_len % 4) {
		case 0:
			i = 0x080000000;
			break;
		case 1:
			i = msg.charCodeAt(msg_len - 1) << 24 | 0x0800000;
			break;
		case 2:
			i = msg.charCodeAt(msg_len - 2) << 24 | msg.charCodeAt(msg_len - 1) << 16 | 0x08000;
			break;
		case 3:
			i = msg.charCodeAt(msg_len - 3) << 24 | msg.charCodeAt(msg_len - 2) << 16 | msg.charCodeAt(msg_len - 1) << 8 | 0x80;
			break;
	}
	word_array.push(i);
	while ((word_array.length % 16) != 14) word_array.push(0);
	word_array.push(msg_len >>> 29);
	word_array.push((msg_len << 3) & 0x0ffffffff);
	for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
		for (i = 0; i < 16; i++) W[i] = word_array[blockstart + i];
		for (i = 16; i <= 79; i++) W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
		A = H0;
		B = H1;
		C = H2;
		D = H3;
		E = H4;
		for (i = 0; i <= 19; i++) {
			temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B, 30);
			B = A;
			A = temp;
		}
		for (i = 20; i <= 39; i++) {
			temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B, 30);
			B = A;
			A = temp;
		}
		for (i = 40; i <= 59; i++) {
			temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B, 30);
			B = A;
			A = temp;
		}
		for (i = 60; i <= 79; i++) {
			temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B, 30);
			B = A;
			A = temp;
		}
		H0 = (H0 + A) & 0x0ffffffff;
		H1 = (H1 + B) & 0x0ffffffff;
		H2 = (H2 + C) & 0x0ffffffff;
		H3 = (H3 + D) & 0x0ffffffff;
		H4 = (H4 + E) & 0x0ffffffff;
	}
	var temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);

	return temp.toLowerCase();
}
function mod_headers(header_array, p_name, p_value) {
	var did_set = false;
	for (var i in header_array) {
		var header = header_array[i];
		var name = header.name;
		var value = header.value;

		// If the header is already present, change it:
		if (name == p_name) {
			header.value = p_value;
			did_set = true;
		}
	}
	// if it is not, add it:
	if (!did_set) { header_array.push({ name: p_name, value: p_value }); }
}
function XHR(purpose, method, url, post_data) {
	var isSucceed = false;
	var response = "";
	var x = new XMLHttpRequest();

	try {
		x.open(method, url, true);
		x.setRequestHeader('Content-type', "application/x-www-form-urlencoded"); //'application/x-www-form-urlencoded'
		x.setRequestHeader("User-Agent", "Mozilla/5.0 (Windows NT 6.3; rv:57.0) Gecko/20100101 Firefox/57.0"); //Mozilla/5.0 (Windows NT 6.3; rv:57.0) Gecko/20100101 Firefox/57.0

		x.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				isSucceed = true;
				response = this.responseText;
				if (purpose == "fbdtsg")
					ParseFBDTSG(response);
				else if (purpose == "thread")
					ParseThread(response.replace("for (;;);", ""));
				else if (purpose == "cloudinary")
					ReceiveCloudinary(response);
			}
			else if (this.status != 200) {
				if (purpose == "cloudinary")
					ReceiveCloudinary(this.responseText);
				else if (purpose == "thread") {
					workingMethod = 2;
					FetchThread();
				}
				else
					ThrowError("HttpError " + this.status, "Couldn't retrieve data.", "Go back", 3);
			}

		};

		x.onerror = function () {
			if (purpose == "cloudinary") {
				desc = "Couldn't connect to Cloudinary. Please check your internet connection!";
				p = 3;
			}
			else {
				desc = "Couldn't connect to Facebook. Please check your internet connection!";
				p = 3;
			}
			ThrowError("Network Error", desc, "Go back", p);
		}

		if (method == "GET")
			x.send();
		else
			x.send(post_data);
	}
	catch (e) {
		ThrowError("Error", e.message, "Go back", 3);
		return;
	}
}
function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}
function IsJsonString(str) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}

//--- Co Functions
function ElemDisp(name, displayX) {
	if (displayX)
		document.getElementById(name).style.display = "inline-block";
	else
		document.getElementById(name).style.display = "none";

	/*if (name == "abte") {
		if (displayX)
			document.getElementById("abte-br").style.display = "inline-block";
		else
			document.getElementById("abte-br").style.display = "none";
	}*/
}
function Sort(json) {
	try {
		//-- Gets list of all conv id and message count. Then sort them. Then put sorted list of ids in result_ids array
		var main_obj = JSON.parse(json);
		var ids = [];
		var counts = [];
		result_ids.length = 0;

		for (var key in main_obj) {
			if (main_obj.hasOwnProperty(key)) {
				ids.push(key);
				counts.push(main_obj[key].count);
			}
		}

		var result = [];
		for (var i = 0; i < counts.length; i++) {

			var num = counts[i];
			var fbid = ids[i];

			if (result.length == 0) {
				result.push(num);
				result_ids.push(fbid);
				continue;
			}

			for (var j = 0; j < result.length; j++) {

				if (num >= result[j]) {
					result.splice(j, 0, num);
					result_ids.splice(j, 0, fbid);
					break;
				}

				if (j == result.length - 1) {
					result.push(num);
					result_ids.push(fbid);
					break;
				}
			}
		}
	}
	catch (e) {
		ThrowError("Runtime Error", "Occured on Sort<br>" + e.message, "Go back", 3);
		return;
	}
}
function ParseFBDTSG(response) {
	parser = new DOMParser();
	htmlDoc = parser.parseFromString(response.replaceAll("<!--", "").replace("-->", ""), "text/html");

	if (htmlDoc.getElementsByName("fb_dtsg").length == 0) {
		ThrowError("Auth Failed", "It seems you are not logged in.", "Go back", 3);
		return;
	}

	fb_dtsg = htmlDoc.getElementsByName("fb_dtsg")[0].value;
	id = htmlDoc.getElementsByName("xhpc_targetid")[0].value;
	FetchThread();
}
function ProcessListMethod2(resp_obj) {

	main_arr = resp_obj.o0.data.viewer.message_threads.nodes;

	var mainObj = {};
	for (i = 0; i < main_arr.length; i++) {
		obj = main_arr[i];

		//id
		fbid = obj.thread_key.other_user_id;
		//isUser
		if (fbid == null) isUser = false; else isUser = true;
		//count
		count = obj.messages_count;

		if (isUser) {
			//loop thru all participants 
			var allUserObj = obj.all_participants.nodes;

			for (var j = 0; j < allUserObj.length; j++) {
				var k = allUserObj[j];
				__id = k.messaging_actor.id;
				if (__id == id) {
					//it is self id, get user full name
					user_name = k.messaging_actor.short_name;
					if (fbid == id) {
						full_name = k.messaging_actor.name;
						name = k.messaging_actor.short_name;
						image = k.messaging_actor.big_image_src.uri;
					}
				}
				else {
					//it is other id, get other name
					full_name = k.messaging_actor.name;
					name = k.messaging_actor.short_name;
					image = k.messaging_actor.big_image_src.uri;
				}
			}

		}
		else {
			var allUserObj = obj.all_participants.nodes;

			for (var j = 0; j < allUserObj.length; j++) {
				var k = allUserObj[j];

				__id = k.messaging_actor.id;
				if (__id == id) {
					//it is self id, get user full name
					user_name = k.messaging_actor.short_name;
				}
			}
			//alert(JSON.stringify(obj));
			full_name = obj.name;
			if (obj.image != null) image = obj.image.uri; else image = null;
			name = "";
			fbid = obj.thread_key.thread_fbid;
		}

		var childObj = {
			"name": name,
			"full_name": full_name,
			"image": image,
			"id": fbid,
			"isUser": isUser,
			"count": count
		};
		mainObj[fbid] = childObj;
	}
	return mainObj;
}
function ProcessListMethod1(resp_obj) {
	//-- Gets data of all conv from Facebook. 
	//-- Then filter and make custom json string (with image, count, name etc data. Object of Objects JSON) of them. 
	//-- Then save custom JSON string to conv_list_json

	thread_arr = resp_obj.payload.threads;
	participants_arr = resp_obj.payload.participants;

	// Checks if method1 works. If not then attempt method2.
	if (participants_arr == undefined) {
		workingMethod = 2;
		FetchThread();
		mainObj = null;
		return mainObj;
	}


	// Gets user_name
	for (i = 0; i < participants_arr.length; i++) {
		if (participants_arr[i].fbid == id) {
			user_name = participants_arr[i].short_name;
			break;
		}
	}

	var mainObj = {};
	for (k = 0; k < thread_arr.length; k++) {

		// obj = thread obj
		obj = thread_arr[k];
		var fbid = obj.thread_fbid;
		var count = obj.message_count;

		//p_obj = participant obj
		var p_obj = null;
		for (i = 0; i < participants_arr.length; i++) {
			if (participants_arr[i].fbid == fbid) {
				p_obj = participants_arr[i];
				break;
			}
		}

		// User and Group conv has different keys.
		if (obj.is_canonical_user == false) {
			var isUser = false;
			var name = null;
			var full_name = obj.name;
			var image = obj.image_src;
		}
		else {
			var isUser = true;
			var name = p_obj.short_name;
			var full_name = p_obj.name;
			var image = p_obj.big_image_src;
		}

		var childObj = {
			"name": name,
			"full_name": full_name,
			"image": image,
			"id": fbid,
			"isUser": isUser,
			"count": count
		};
		mainObj[fbid] = childObj;
	}
	return mainObj;
}

function ParseThread(response) {

	if (workingMethod == 2) response = RemoveExtraJson(response);

	if (!IsJsonString(response)) {
		ThrowError("Invalid Response", "Server didn't sent JSON string.", "Go back", 3);
		return;
	}

	var resp_obj = JSON.parse(response);

	if (resp_obj.error != null) {
		ThrowError("Unexpected Response", "Facebook said, \"" + resp_obj.errorSummary + ". " + resp_obj.errorDescription + "\"", "Go back", 3);
		return;
	}

	try {
		var mainObj = {};

		if (workingMethod == 1)
			mainObj = ProcessListMethod1(resp_obj);
		else
			mainObj = ProcessListMethod2(resp_obj);

		if (mainObj == null) return;

		filtered_list = JSON.stringify(mainObj);

		conv_list_json = filtered_list;
		Sort(filtered_list);

		new_result = true;
		curr_state = 3;

		UpdateTitleAndDetails();
	}
	catch (e) {
		ThrowError("Runtime Error", "Occured on ParseThread<br>" + e.message, "Go back", 3);
		return;
	}
}
function ReceiveCloudinary(response) {
	//-- Receives response after trying to upload on Cloudinary
	var obj = JSON.parse(response);
	if (obj.error == null) {
		result_url = obj.secure_url;
		// Result image is uploaded. So this result is not new to the server.
		new_result = false;
		OpenSharer();
		document.getElementById("share").innerHTML = "Share";
	}
	else {
		ThrowError("Cloudinary Error", obj.error.message, "Go back", 3);
		return;
	}
	document.getElementById("continue").disabled = false;
	document.getElementById("clear").disabled = false;
	document.getElementById("share").disabled = false;
}
function RemoveExtraJson(response) {
	var last_index = response.lastIndexOf("{");
	return response.slice(0, last_index);
}
//--- Main Functions
function WindowOnLoad() {
	UpdateTitleAndDetails();
	// Sets onclick events for elements
	document.getElementById("continue").onclick = OnClickContinue;
	document.getElementById("clear").onclick = OnClickClear;
	document.getElementById("share").onclick = OnClickShare;
	document.getElementById("checkboxX").onclick = OnClickCheckbox;
	document.getElementById("terms").onclick = OnClickTerms;
	document.getElementById("about").onclick = OnClickAbout;
	document.getElementById("policy").onclick = OnClickPolicy;
	document.getElementById("textbox").oninput = OnInputTextBox;
	canvas = document.getElementById("canvas");
	ElemDisp("canvas", false);

	// Hides display division to avoid glitch
	ElemDisp("display", true);

	// iframe for Facebook page like button
	var ih = '<iframe id="iframe-like" src="https://www.facebook.com/plugins/like.php?href=https://www.facebook.com/rafsun82&width=51&layout=button&action=like&size=small&show_faces=false&share=false&height=65&appId=1937691456443937" width="60" height="20" style="border:none;" scrolling="no" frameborder="1" allowTransparency="true"></iframe><br>Like my Facebook page for support!';
	document.getElementById("like").innerHTML = ih;

	// To close popups
	browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
		if (tab.url.indexOf("https://www.facebook.com/plugins/close_popup.php") != -1) {
			iframe = document.getElementById("iframe-like");
			iframe.src = iframe.src;
			browser.tabs.remove(tabId);
		}
		else if (tab.url.indexOf("https://www.facebook.com/dialog/return/close") != -1) {
			iframe = document.getElementById("iframe-like");
			iframe.src = iframe.src;
			browser.tabs.remove(tabId);
		}
	});
}
function UploadCloudinary() {
	//-- Uploads to Cloudinary
	var key = "999736996212663";
	var secret = "VYN8L9CnVOrDQ22fjrkyHnbSMRw";
	var timestamp = Math.round((new Date()).getTime() / 1000);
	var img_uri = canvas.toDataURL("image/png");
	file = encodeURIComponent(img_uri);
	var signature = SHA1("public_id={0}&timestamp={1}{2}".format(SHA1(id), timestamp, secret));
	var url = "https://api.cloudinary.com/v1_1/rafsun82/image/upload?";
	var post_data = "public_id=" + SHA1(id) +
		"&timestamp=" + timestamp +
		"&api_key=" + key +
		"&signature=" + signature +
		"&file=" + file;
	XHR("cloudinary", "POST", url, post_data);
}
function OpenSharer() {
	//-- Open share dialog
	url = "https://www.facebook.com/dialog/share?app_id={0}&href={1}&hashtag={2}".format("1937691456443937", result_url, "%23MyTopThreeFriends");
	var win = window.open((url), "_blank", 'height=570,width=760');
}
function UpdateCanvasDetails() {
	//-- Update details that will be drawn on canvas
	user_name = user_name;
	person1_name = person[0].name;
	person2_name = person[1].name;
	person3_name = person[2].name;
	person1_number = numberWithCommas(person[0].count);
	person2_number = numberWithCommas(person[1].count);
	person3_number = numberWithCommas(person[2].count);
	person1_imgsrc = "https://graph.facebook.com/{0}/picture?width=150&height=150".format(person[0].id);
	person2_imgsrc = "https://graph.facebook.com/{0}/picture?width=150&height=150".format(person[1].id);
	person3_imgsrc = "https://graph.facebook.com/{0}/picture?width=150&height=150".format(person[2].id);
}
function UpdateTitleAndDetails() {
	switch (curr_state) {
		// Terms 
		case 1: {
			title = "Terms & Conditions";
			details = "- You should use this extension\\add-on for personal purposes.<br><br>- This extension\\add-on needs some special permissions from your browser. Mainly for reading data from facebook.com and storing application states in local storage.<br><br>- Using this extension or keeping it installed is safe as long as your system is not infected. Since some sensitive permissions may be granted by you (during installation), you need to make sure this extension\\add-on is secure from any malicious program (in your system) to keep your data secure.<br><br>- If this extension\\add-on gets infected by malicious program from your system, the developer won't be responsible for any kind of data abuse or leak. To learn about how your personal data is collected and used (by this extension\\add-on) read Privacy Policy.<br><br>- You cannot copy, redistribute, sell, modify this extension\\add-on.<br>- You cannot look at the underlying code.<br>- You cannot use any resources or source codes of this extension\\add-on.<br>- Copyright reserved to the developer.";
			if (shouldShowTerms)
				document.getElementById("continue").innerHTML = "I read and accepted the terms";
			else
				document.getElementById("continue").innerHTML = "Go back";
			document.getElementById("title").style.backgroundColor = h1_col_warning;

			ElemDisp("like", false);
			ElemDisp("abte", false);
			ElemDisp("share", false);
			ElemDisp("clear", false);
			ElemDisp("label", false);
			ElemDisp("table", false);
			ElemDisp("textbox", false);
		} break;
		// Privacy Policy
		case 2: {
			title = "Privacy Policy";
			details = "- This extension\\add-on collects list of all Facebook conversations and participants' basic data which are number of total messages, user name, profile image, group conversation's display image.<br><br>- Collected data are kept for short time on memory. They are not stored in any local storage. They are not sent to anywhere else through the internet. They are destroyed once browser is closed or reloaded or user is commanded to clear them.<br><br>- If user wants he\\she can publish some data (top three conversation) on their Facebook timeline which is done by a share dialog box (with user's knowledge). In this case those data are saved as image (includes profile picture, short name and number of total messages) in a image hosting service named Cloudinary. Saved images are kept private, only the developer can see them.<br><br>- It uses browser's local storage to store some application states, does not store any personal data.<br><br>- Facebook Like iframe and it's CDN images are used. It may track addon users to target ads.";
			if (shouldShowTerms)
				document.getElementById("continue").innerHTML = "Next";
			else
				document.getElementById("continue").innerHTML = "Go back";
			document.getElementById("title").style.backgroundColor = h1_col_warning;

			ElemDisp("like", false);
			ElemDisp("abte", false);
			ElemDisp("share", false);
			ElemDisp("clear", false);
			ElemDisp("label", false);
			ElemDisp("table", false);
			ElemDisp("textbox", false);
		} break;
		// Conversation list
		case 3: {
			title = "Conversation List";
			document.getElementById("continue").innerHTML = "Update";
			document.getElementById("share").innerHTML = "Share";

			ElemDisp("like", true);
			ElemDisp("abte", true);
			ElemDisp("share", true);
			ElemDisp("clear", true);

			document.getElementById("continue").disabled = false;

			shouldShowTerms = false;

			if (conv_list_json == null) {
				details = "The list is empty. Click Update to fetch data.";
				document.getElementById("share").disabled = true;
				document.getElementById("clear").disabled = true;
				document.getElementById("table").style.display = "none";
				document.getElementById("textbox").style.display = "none";
				document.getElementById("table").innerHTML = "";
				document.getElementById("label").style.display = "none";;
			}
			else {
				details = "<a href='https://addons.mozilla.org/en-US/firefox/addon/top-convos/reviews/' target='_blank'>Post a review</a> on Mozilla Addon Store to share your experience with others.";
				UpdateTable();
				document.getElementById("share").disabled = false;
				document.getElementById("clear").disabled = false;
				document.getElementById("label").style.display = "inline-block";
				document.getElementById("table").style.display = "inline-block";
				document.getElementById("textbox").style.display = "inline-block";
			}

			document.getElementById("title").style.backgroundColor = h1_col_normal;
		} break;
		// Updating
		case 4: {
			title = "Updating";
			details = "Please wait while list is being updated...";
			document.getElementById("like").style.display = "none";
			document.getElementById("title").style.backgroundColor = h1_col_warning;

			document.getElementById("continue").innerHTML = "Don't click";

			ElemDisp("like", false);
			ElemDisp("abte", false);
			ElemDisp("share", false);
			ElemDisp("clear", false);
			ElemDisp("label", false);
			ElemDisp("table", false);
			ElemDisp("textbox", false);

			document.getElementById("continue").disabled = true;
			FetchFBDTSG();
		} break;
		// About
		case 7: {
			title = "ABOUT";
			details = 'Version: 1.1.1<br>Developer: (C) Rafsun Masud Prince (Known as RAF5UN)<br><br>Feel free to send feedback on pm and follow to get news about upcoming projects.<br><br><u>Social & Contact links</u><br>Twitter: <a target="_blank" href="https://www.twitter.com/rafsun82">@rafsun82</a><br>Facebook: <a target="_blank" href="https://www.fb.com/rafsun82">fb\\rafsun82</a><br>YouTube: <a target="_blank" href="https://www.youtube.com/channel/UCt_KFtV6rpj6EjHe4tFWHeQ">Rafsun82</a><br>Gmail: rmprince14bd@gmail.com<br>';
			document.getElementById("continue").innerHTML = "Go back";
			document.getElementById("title").style.backgroundColor = h1_col_warning;
			ElemDisp("like", false);
			ElemDisp("abte", false);
			ElemDisp("share", false);
			ElemDisp("clear", false);
			ElemDisp("label", false);
			ElemDisp("table", false);
			ElemDisp("textbox", false);
		} break;
		// Error
		case -1: {
			document.getElementById("title").style.backgroundColor = h1_col_error;
			document.getElementById("continue").disabled = false;
			ElemDisp("like", false);
			ElemDisp("abte", false);
			ElemDisp("share", false);
			ElemDisp("clear", false);
			ElemDisp("label", false);
			ElemDisp("table", false);
			ElemDisp("textbox", false);
		} break;
	}
	document.getElementById("title").innerHTML = title.toUpperCase();
	document.getElementById("details").innerHTML = details;
}
function FetchFBDTSG() {
	XHR("fbdtsg", "GET", "https://www.facebook.com/", "");
}
function FetchThread() {
	var url = "";
	var post_data = "";
	if (workingMethod == 1) {
		url = "https://www.facebook.com/ajax/mercury/threadlist_info.php?dpr=1";
		post_data = "client=web_messenger&inbox[offset]=0&inbox[limit]=1000&inbox[filter]&__user={0}&fb_dtsg={1}&__a=1".format(id, fb_dtsg);
	}
	else {
		url = "https://www.facebook.com/api/graphqlbatch/";
		post_data = "__user={0}&__a=1&fb_dtsg={1}&queries=%7B%22o0%22%3A%7B%22doc_id%22%3A%221349387578499440%22%2C%22query_params%22%3A%7B%22limit%22%3A1000%2C%22before%22%3Anull%2C%22includeDeliveryReceipts%22%3Atrue%2C%22includeSeqID%22%3Afalse%7D%7D%7D".format(id, fb_dtsg);
	}
	XHR("thread", "POST", url, post_data);
}
function ThrowError(titlex, desc, button, pending) {
	curr_state = -1;
	title = titlex;
	details = desc;
	pending_stage = pending;
	document.getElementById("continue").innerHTML = button;
	UpdateTitleAndDetails();
}
function UpdateTable() {
	var table_str = '<table id="table_list">';
	// style="width:330px;table-layout:fixed;"
	var main_obj = JSON.parse(conv_list_json);
	for (i = 0; i < result_ids.length; i++) {
		fbid = result_ids[i];
		img = main_obj[fbid].image;
		name = main_obj[fbid].full_name;
		count = main_obj[fbid].count;
		count = numberWithCommas(count);
		isUser = main_obj[fbid].isUser;

		if (img == null) img = "images/group_not_found.png";

		// Ignore groups
		if (isUser == false & isUsersOnly == true) {

			continue;
		}

		var search_val = document.getElementById("textbox").value.toLowerCase().trim();
		var match_index = name.toLowerCase().indexOf(search_val);
		if (search_val != "") {
			if (match_index == -1)
				continue;
			else {
				name = name.splice(match_index, 0, "<b>").splice(match_index + search_val.length + 3, 0, "</b>");
			}
		}

		table_str += '<tr id="list_tr">';
		table_str += '<td id="imj_td"><img id="imj" src="{0}"></td>'.format(img);
		table_str += '<td id="name_td">{0}</td>'.format(name);
		table_str += '<td id="count_td">{0}</td>'.format(count);
		table_str += "</tr>";
	}

	table_str += "</table>";

	document.getElementById("table").innerHTML = table_str;
}
function FindTopThree() {
	//-- Finds top three result from whole conversation list and push them to person[] array
	if (!new_result) {
		OpenSharer();
		return false;
	}

	main_obj = JSON.parse(conv_list_json);
	var found = 0;
	person.length = 0;
	for (i = 0; i < result_ids.length; i++) {
		if (found == 3) break;

		obj = main_obj[result_ids[i]];
		if (obj.isUser == true) {
			person.push(obj);
			found++;
		}
	}
	UpdateCanvasDetails();
	LoadAndDrawImages();
	return true;
}

//--- Events OnClick
function OnClickContinue() {
	switch (curr_state) {
		case 1: {
			if (shouldShowTerms)
				curr_state = 2;
			else
				curr_state = 3;
		} break;
		case 2: {
			curr_state = 3;
		} break;
		case 3: {
			curr_state = 4;

		} break;

		case 7: {
			curr_state = 3;
		} break;
		case -1: {
			curr_state = pending_stage;
			pending_stage = 0;
		} break;

	}
	UpdateTitleAndDetails();
}
function OnClickClear() {
	conv_list_json = null;
	curr_state = 3;
	UpdateTitleAndDetails();
}
function OnClickShare() {
	var shouldChange = FindTopThree();
	if (shouldChange) {
		document.getElementById("continue").disabled = true;
		document.getElementById("clear").disabled = true;
		document.getElementById("share").disabled = true;
		document.getElementById("share").innerHTML = "Wait...";
	}
}
function OnClickCheckbox() {
	cb = document.getElementById("checkboxX");
	isUsersOnly = cb.checked;
	UpdateTable();
}
function OnClickTerms() {
	if (curr_state == 3 & document.getElementById("share").innerHTML == "Share") {
		curr_state = 1;
		UpdateTitleAndDetails();
	}
}
function OnClickAbout() {
	if (curr_state == 3 & document.getElementById("share").innerHTML == "Share") {
		curr_state = 7;
		UpdateTitleAndDetails();
	}
}
function OnClickPolicy() {
	if (curr_state == 3 & document.getElementById("share").innerHTML == "Share") {
		curr_state = 2;
		UpdateTitleAndDetails();
	}
}
function OnInputTextBox() {
	UpdateTable();
}
//try {document.getElementById("continue").innerHTML = "Continue"; } catch (e) { alert(e.message); }
//document.getElementById("details").innerText = filtered_list;