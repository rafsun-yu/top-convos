var tcLoader = (function () {

    /**
     * Gets authentication tokens.
     * 
     * Fetches 'fb_dtsg' and 'c_user' from 'facebook.com'. These tokens
     * are required to make other webrequest to Facebook.
     * 
     * @requires log.js -> log
     * @requires DOMParser
     * 
     * @requires loader.js -> http 
     * 
     * @returns {*} JSON Object with keys: 'fb_dtsg' and 'c_user' or NULL on error.
     */
    async function getAuthTokens() {

        log.l("loader.js:getAuthTokens");

        try {

            let doc, parser, html, fb_dtsg, c_user;
            parser = new DOMParser();
    
            // Gets html string of the whole page
            html = await http("https://www.facebook.com", false, null);
            doc = parser.parseFromString(html, "text/html");
            log.m("Position of substring 'fb_dtsg' in the whole html string: " + html.indexOf("fb_dtsg"));
            html = "";
    
            // Looks for <div class="hidden_elem">
            let hiddenElems = $("div[class*='hidden_elem']", doc).children();
            log.m("Number of childrens of 'div.hidden_elem': " + hiddenElems.length);
    
            for(i = 0; i < hiddenElems.length; i++) {
    
                // If substring 'fb_dtsg' is found inside innerHtml of any <div>
                if ($(hiddenElems[i]).html().indexOf("fb_dtsg") != -1) {
    
                    html = $(hiddenElems[i]).html();
    
                    // Takes the html string inside comments
                    html = html.split("<!--")[1];
                    html = (html != undefined) ? html.split("-->")[0] : undefined;
    
                    break;
                }
    
            }
    
            // Filters fb_dtsg and c_user if found
            fb_dtsg = c_user = "";

            if (html == undefined)
                log.w("Variable 'html' is undefined after filtering from comments");
            else if (html != "") {
    
                doc = parser.parseFromString(html, "text/html");
    
                fb_dtsg = $("input[name='fb_dtsg']", doc).attr("value");
                fb_dtsg = encodeURIComponent(fb_dtsg).trim();
                c_user = $("input[name='xhpc_targetid']", doc).attr("value").trim();
                
            }
            else
                log.w("Substring 'fb_dtsg' cannot be found in any div.hidden_elem");

            log.m("FB_DTSG Length: " + fb_dtsg.length);
            log.m("C_USER Length: " + c_user.length);

            if (fb_dtsg != "" || c_user != "")
                return { fb_dtsg: fb_dtsg, c_user: c_user };

        }
        catch (err) {
            log.e(err.message + " @ " + err.stack);
        }

        return null;

    }

    /** [ASYNC] Loads and Returns final.json from local storage */
    async function loadObjFinalFromLocal(c) {
        
        let jsonString = await http("../.doc/final.json", false, null);
        let jsonObj = JSON.parse(jsonString);
        return jsonObj;
    }

    /**
     * Creats HTTP WebRequest.
     * 
     * Use this function to fetch text or html based data.
     * 
     * @param {string} url URL to download.
     * @param {bool} isPost Whether method is POST. Otherwise GET.
     * @param {*} postData Post data for POST method. Pass null for GET method.
     * 
     * @requires log.js -> log
     * @requires Promise
     * 
     * @return {string} Response string or NULL on error.
     */
    async function http(url, isPost, postData) {

        try {

            return await new Promise(resolve => {

                let xhr = new XMLHttpRequest();
                xhr.open("GET", url);

                log.m("XHR", "URL", url);
                
                xhr.onreadystatechange = function () {

                    if(xhr.readyState === 4) {

                        log.m("XHR", "StatusCode", xhr.status);

                        if(xhr.status === 200)
                        {
                            let responseString = xhr.responseText;
                            resolve(responseString);
                        }
                        else {
                            resolve(null);
                        }
                    }
                }
    
                xhr.ontimeout = function (err) {
                    log.w("XHR", "TimeOut", err.message);
                    resolve(null);
                }

                xhr.onerror = function (err) {
                    log.w("XHR", err.message);
                    resolve(null);
                }
    
                xhr.send(null);
             });

        }
        catch (err) {
            log.e("XHR", err.message);
            return null;
        }
        
    }

    return {
        loadObjFinalFromLocal: loadObjFinalFromLocal,
        getAuthTokens: getAuthTokens
    }

})();