var tcLoader = (function () {

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
                let method = isPost ? "POST" : "GET";
                xhr.open(method, url);

		        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
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
    
                xhr.send(postData);
             });

        }
        catch (err) {
            log.e("XHR", err.message);
            return null;
        }
        
    }

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

    /**
     * Gets raw thread data.
     * 
     * Thread data is JSON data related to Facebook threads.
     * Raw means the data directly received from the server.
     * 
     * @param {Object} authTokens JSON Object containing 'fb_dtsg' and 'c_user'.
     * 
     * @requires helper.js -> isValidJson
     * @requires loader.js -> http
     * 
     * @see /.doc/raw.json
     * 
     * @returns {Object} JSON object of raw data or NULL on error.
     */
    async function getRawData(authTokens) {

        try {

            log.l("loader.js:getRawData");

            let url = "https://www.facebook.com/api/graphqlbatch/";
            let postData = "__user={0}&__a=1&fb_dtsg={1}".format(authTokens["c_user"], authTokens["fb_dtsg"]);
            postData += "&queries=%7B%22o0%22%3A%7B%22doc_id%22%3A%221349387578499440%22%2C%22query_params%22%3A%7B%22limit%22%3A1000%2C%22before%22%3Anull%2C%22includeDeliveryReceipts%22%3Atrue%2C%22includeSeqID%22%3Afalse%7D%7D%7D";
        
            let json = await http(url, true, postData);

            // Removes extra JSON object at the end of the response string
            let lastIndex = json.lastIndexOf("{");
            json = json.slice(0, lastIndex); 

            if (!isValidJson(json)) {

                log.w("Invalid JSON string.");
                return null;

            }

            log.m("JSON string length: " + json.length);
            return JSON.parse(json);

        }
        catch (err) {

            log.e(err.message + " @ " + err.stack);
            return null;

        }
    }

    /**
     * Creates finalData from rawData.
     * 
     * Creates JSON array of threads (finalData) for UI, 
     * from data received from server (rawData).
     * 
     * @param {*} rawData JSON of raw data.
     * 
     * @requires helper.js -> addCommasInNumber
     * @requires loader.js -> createUntitledGroupName
     * @requires loader.js -> getShortName
     * 
     * @see final.json (structure of finalData)
     * @see raw.json (structure of rawData)
     * 
     * @return JSON array of final data or NULL on error.
     */
    function createFinalData(rawData) {

        try {

            log.l("loader.js:createFinalData");

            let finalData = [];
            let threads = rawData.o0.data.viewer.message_threads.nodes;

            // Loops through all threads
            threads.forEach(t => {
                
                let obj;
                let fbid, is_user, full_name, short_name, image_url, count, count_str;
                
                // Sets the common fields in USERS and GROUPS type.
                is_user = (t.thread_key.thread_fbid == null);
                count = t.messages_count;
                count_str = addCommasInNumber(count);

                // Sets the uncommon fields.
                if (is_user) {

                    fbid = t.thread_key.other_user_id;

                    // Chooses the OTHER_USER object from participants array
                    let other_user;
                    for(i = 0; i < 2; i++) {

                        other_user = t.all_participants.nodes[i].messaging_actor;

                        if (other_user.id == fbid) {

                            full_name = other_user.name;
                            short_name = other_user.short_name;
                            short_name = short_name == null ? getShortName(full_name) : short_name;
                            image_url = other_user.big_image_src;
                            image_url = image_url == null ? "images//error-image.jpg" : image_url.uri;

                        }
                        else 
                            other_user = null;
                    } // END OF FOR
                } // END OF IF
                else {
                    // dont forget about unnamed groups
                    let name = t.name;
                    name = name == null ? createUntitledGroupName(t.all_participants.nodes) : name;
                    fbid = t.thread_key.thread_fbid;
                    full_name = name;
                    short_name = name;
                    image_url = t.image;
                    image_url = image_url == null ? "images//group_not_found.png" : image_url.uri;

                }

                // Adds in finalData
                obj = {

                    fbid: fbid,
                    is_user: is_user,
                    full_name: full_name,
                    short_name: short_name,
                    image_url: image_url,
                    count: count,
                    count_str: count_str

                }

                finalData.push(obj);

            });

            log.m("SUCCEED", "True");
            return finalData;

        }
        catch(err) {
            log.w("SUCCEED", "False");
            log.e(err.message + " @ " + err.stack);
            return null;
        }
        
    }

    /**
     * Creates group name from its users' first name.
     * 
     * @param {*} nodes all_participants.nodes array from a thread object in rawData
     * 
     * @returns {string} Group name or 'Untitled' on error.
     */
    function createUntitledGroupName(nodes) {

        try {
            let groupName = "";
            let len = nodes.length;
            // Number of usernames (max 4) in groupName. For example, Rafsun, Hasan, Arafat and 5 others.
            let count = len > 4 ? 4 : len;
    
            for (i = 0; i < count; i++) {
    
                let user = nodes[i].messaging_actor;
                full_name = user.name;
                short_name = user.short_name;
                short_name = short_name == null ? full_name : short_name;
    
                if (i == count - 1) {
    
                    if (count == len) {
    
                        groupName += len == 1 ? "" : "and ";
                        groupName += short_name;
    
                    }
                    else {
    
                        let remaining = len - count + 1;
                        groupName += "and {0} others".format(remaining);
    
                    }
    
                }
                else {
    
                    groupName += short_name;
                    groupName += i != count-2 ? "," : "";
                    groupName += " ";
    
                }
    
            }
    
            return groupName == "" ? "Untitled Group" : groupName;
        }
        catch (err) {
            log.e(err.message + " @ " + err.stack);
            return "Untitled";
        }
    }

    /**
     * Creates first name from long names.
     * 
     * Splits long name by space character, takes the first element
     * as first name.
     * 
     * @param {*} full_name Full name contaning spaces.
     * 
     * @returns {string} First name or 'full_name' if no space character found.
     */
    function getShortName(full_name) {

        if (full_name.indexOf(" ") != -1)
            return full_name.split(" ")[0];
        else
            return full_name;

    }

    /** [ASYNC] Loads and Returns final.json from local storage */
    async function loadObjFinalFromLocal(c) {
        
        let jsonString = await http("../.doc/final.json", false, null);
        let jsonObj = JSON.parse(jsonString);
        return jsonObj;
    }



    return {
        loadObjFinalFromLocal: loadObjFinalFromLocal,
        getAuthTokens: getAuthTokens,
        getRawData: getRawData,
        createFinalData: createFinalData,
        createUntitledGroupName: createUntitledGroupName
    }

})();