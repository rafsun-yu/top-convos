
// Helpers
function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

async function http(url, isPost, postData) {
	try {

		var xhr = await new Promise(resolve => {

	        let xhr = new XMLHttpRequest();
	        let method = isPost ? "POST" : "GET";
	        xhr.open(method, url);
	        xhr.setRequestHeader("User-Agent", "Mozilla/5.0 (Windows NT x.y; rv:10.0) Gecko/20100101 Firefox/10.0");
	        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

	        xhr.onreadystatechange = function () {
	            if (xhr.readyState === 4) {
	                resolve(xhr);
	            }
	        }

	        xhr.send(postData);
	    });

	    return xhr;
	}
	catch (err) {
		console.log(err.message);
	    return null;
	}
}

// Main
async function getPageSource() {
	var xhr = await http("https://www.facebook.com", false, null);
	console.log(xhr.getAllResponseHeaders());
	//download("homepage-source.txt", data.response);
}
await getPageSource();
