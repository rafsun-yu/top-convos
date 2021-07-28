var tcLoader = (function () {

    // Facebook share image url.
    let imageUrl = "";

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
     * @return {string} {"response": ..., "status": ...} (response: null on error).
     */
    async function http(url, isPost, postData) {
        try {

            let html = { response: null, status: -1 };
            let xhrStatus = null;

            html = await new Promise(resolve => {

                let xhr = new XMLHttpRequest();
                let method = isPost ? "POST" : "GET";
                xhr.open(method, url);
                //xhr.setRequestHeader("User-Agent", "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36");
                xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {

                        xhrStatus = xhr.status;
                        resolve({
                            response: xhr.responseText,
                            status: xhr.status
                        });

                    }
                }

                xhr.send(postData);
            });

            // Exclude some links.
            if (url.indexOf("dropboxusercontent") == -1 && url.indexOf("plugins/like.php") == -1)
                log.m("XHR", "Status", "URL", xhrStatus + " " + url);

            return html;
        }
        catch (err) {
            log.e("XHR", url, "ERROR", err.message);
            return {
                response: null,
                status: -1
            };
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
     * @requires loader.js -> http 
     * 
     * @returns {*} JSON Object with keys: 'fb_dtsg' and 'c_user' || NULL on error || -1 on internet fail.
     */
    async function getAuthTokens() {

        log.l("AuthTokens");

        try {
            let doc, parser, html, fb_dtsg, c_user;
            parser = new DOMParser();

            // Gets html string of the whole page
            html = await http("https://www.facebook.com", false, null);
            //html = await http("../../.doc/y.html", false, null);
            html = html.response;

            if (html == null)
                return -1;

            doc = parser.parseFromString(html, "text/html");

            // Filters out c_user
            let queryStr = '"ACCOUNT_ID":"';
            log.m("ID", "Index of substring: " + html.indexOf(queryStr));

            if (html.indexOf(queryStr) != -1) {
                c_user = html.slice(html.indexOf(queryStr) + queryStr.length);
                c_user = c_user.slice(0, c_user.indexOf('"'));
            }

            log.m("ID", "Length: " + (c_user == undefined ? -1 : c_user.length));

            // Looks for <div class="hidden_elem"> for fb_dtsg
            log.m("Token", "Index of substring: " + html.indexOf("fb_dtsg"));

            let hiddenElems = $("div[class*='hidden_elem']", doc).children();
            log.m("Token", "Number of childrens of div.hidden_elem: " + hiddenElems.length);

            for (i = 0; i < hiddenElems.length; i++) {
                // If substring 'fb_dtsg' is found inside innerHtml of any <div>
                let tempHtml = $(hiddenElems[i]).html();
                if (tempHtml.indexOf("fb_dtsg") != -1) {
                    html = $(hiddenElems[i]).html();

                    // Takes the html string inside comments
                    html = html.split("<!--")[1];
                    html = (html != undefined) ? html.split("-->")[0] : undefined;

                    break;
                }
            }

            // Filters out fb_dtsg
            if (html == undefined)
                log.w("Token", "Variable 'html' is undefined after filtering from comments");
            else if (html != "") {
                doc = parser.parseFromString(html, "text/html");
                fb_dtsg = $("input[name='fb_dtsg']", doc).attr("value").trim();
                fb_dtsg = encodeURIComponent(fb_dtsg).trim();
            }
            else
                log.w("Token", "Substring cannot be found in any div.hidden_elem");

            log.m("Token", "Length: " + fb_dtsg == undefined ? -1 : fb_dtsg.length);

            // Returns
            html = "";
            if (fb_dtsg != undefined && c_user != undefined)
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
     * @returns {Object} JSON object of raw data || NULL on error || -1 on internet fail
     */
    async function getRawData(authTokens) {
        try {

            log.l("RawData");

            let tempJson, tempThreads, postData, json, status, lastIndex;
            let finalJson = { "o0": { "data": { "viewer": { "message_threads": { "nodes": [] } } } } };
            let finalThreads = finalJson.o0.data.viewer.message_threads.nodes;
            let url = "https://www.facebook.com/api/graphqlbatch/";
            let perRequest = 1000;
            let before = null;
            let totalThreads = 0;
            let loadedThreads = 0;
            let attempts = 0;

            while (1) {
                attempts++;

                if (perRequest > 1000 - totalThreads)
                    perRequest = 1000 - totalThreads < 1 ? 1 : 1000 - totalThreads;

                postData = "__user={0}&__a=1&fb_dtsg={1}".format(authTokens["c_user"], authTokens["fb_dtsg"]);
                postData += "&queries=" + JSON.stringify({
                    "o0": {
                        "doc_id": "1349387578499440",
                        "query_params": {
                            "limit": perRequest,
                            "before": before,
                            "includeDeliveryReceipts": true,
                            "includeSeqID": false
                        }
                    }
                });

                // Loads and validates JSON.
                result = await tcLoader.http(url, true, postData);
                json = result.response;
                status = result.status;

                if (json == null)
                    return -1;

                if (!(status == 500 || status == 200))
                    return -1;

                if (status == 500) {
                    perRequest = Math.round(perRequest / 2);
                    if (perRequest < 2) perRequest = 2;
                    log.m("Attempts", attempts, "ErrorStatus500", "PerRequest", perRequest);

                    await new Promise(resolve => {
                        $("#floating-msg").fadeIn(400, function() {
                            resolve();
                        });
                    });

                    continue;
                }

                lastIndex = json.lastIndexOf("{");
                json = json.slice(0, lastIndex); // Removes extra JSON at the end.

                if (!isValidJson(json)) {
                    log.w("Invalid JSON string.");
                    return null;
                }

                // Inject into finalThreads
                tempJson = JSON.parse(json);
                tempThreads = tempJson.o0.data.viewer.message_threads.nodes;
                loadedThreads = tempThreads.length;

                log.m("Attempts", attempts, "PerRequest", "LoadedThreads", perRequest + " " + loadedThreads);

                for ((attempts == 1 ? i = 0 : i = 1); i < tempThreads.length; i++) {
                    finalThreads.push(tempThreads[i]);
                    totalThreads++;
                    if (i == tempThreads.length - 1)
                        before = tempThreads[i].updated_time_precise;
                }

                // End loop
                if (totalThreads >= 1000 || loadedThreads == 1) {
                    log.m("Loaded", totalThreads);
                    
                    await new Promise(resolve => {
                        $("#floating-msg").fadeOut(400, function() {
                            resolve();
                        });
                    });
                    
                    break;
                }
            }

            return (finalJson);
        }
        catch (err) {

            log.e(err.message + " @ " + err.stack);
            return null;

        }
    }

    /**
     * Creates all child objects of mainData from rawData
     * except mainData.authTokens.
     * 
     * Creates JSON array of threads (finalData) for UI, 
     * from data received from server (rawData) and JSON
     * object of logged in user's information.
     * 
     * @param {*} rawData JSON of raw data.
     * 
     * @requires helper.js -> addCommasInNumber
     * @requires loader.js -> createUntitledGroupName
     * @requires loader.js -> getShortName
     * 
     * @see final.json (structure of finalData)
     * @see raw.json (structure of rawData)
     * @see outline.txt
     * 
     * @return JSON object containing finalData and loggedUser or NULL on error.
     */
    function createMainData(c_user, rawData) {
        try {

            log.l("FinalData");

            let finalData = [];
            let loggedUser = null;
            let topUsers = null;
            let threads = rawData.o0.data.viewer.message_threads.nodes;

            // Loops through all threads
            threads.forEach(t => {

                let obj;
                let fbid, is_user, name, short_name, name_tag, custom_name, image_url, custom_image, count, count_str;

                // Sets the common fields in USERS and GROUPS type.
                is_user = (t.thread_key.thread_fbid == null);
                count = t.messages_count;
                count_str = addCommasInNumber(count);

                // Sets the uncommon fields.
                if (is_user) {

                    fbid = t.thread_key.other_user_id;

                    // Chooses the OTHER_USER object from participants array
                    let other_user;
                    for (i = 0; i < t.all_participants.nodes.length; i++) {

                        other_user = t.all_participants.nodes[i].messaging_actor;

                        if (other_user.id == fbid) {

                            // name
                            name = other_user.name;
                            name = name == "" ? "Unknown" : name;

                            // short_name
                            short_name = other_user.short_name;
                            short_name = short_name == null ? getShortName(name) : short_name;

                            // name_tag
                            name_tag = other_user.name == "" ? "" : name.toLowerCase();

                            // custom_name
                            custom_name = other_user.name == "";

                            // users
                            users = [name];

                            // image url
                            image_url = other_user.big_image_src;
                            image_url = image_url == null ? "img/others/placeholder-user-image.png" : image_url.uri;

                            // custom_image
                            custom_image = other_user.big_image_src == null;

                        }
                        else
                            other_user = null;
                    } // END OF FOR
                } // END OF IF
                else {

                    fbid = t.thread_key.thread_fbid;

                    // name
                    name = t.name;
                    name = name == null ? createUntitledGroupName(t.all_participants.nodes) : name;

                    // short_name
                    short_name = null;

                    // name_tag
                    name_tag = getGroupsNameTag(t.all_participants.nodes);

                    // custom_name
                    custom_name = t.name == null;

                    // users
                    users = getGroupsUsersList(t.all_participants.nodes);

                    // image_url
                    image_url = t.image;
                    image_url = image_url == null ? "img/others/placeholder-group-image.png" : image_url.uri;

                    // custom_image
                    custom_image = t.image == null;

                }

                // Adds in finalData
                obj = {
                    fbid: fbid,
                    is_user: is_user,
                    name: name,
                    short_name: short_name,
                    name_tag: name_tag,
                    custom_name: custom_name,
                    users: users,
                    image_url: image_url,
                    custom_image: custom_image,
                    count: count,
                    count_str: count_str
                }

                finalData.push(obj);

                // Creates loggedUser object
                if (!loggedUser) {
                    loggedUser = getLoggedUserData(c_user, t.all_participants.nodes);
                }

            });

            finalData = sortFinalData(finalData);
            topUsers = getTopUsers(finalData);

            log.m("SUCCEED", !loggedUser || !topUsers ? "False" : "True");

            return {
                finalData: finalData,
                loggedUser: loggedUser,
                topUsers: topUsers
            }

        }
        catch (err) {
            log.w("SUCCEED", "False");
            log.e(err.message + " @ " + err.stack);
            return null;
        }
    }

    /**
     * Sorts finalData in ascending order.
     * 
     * @param {*} finalData final.json.
     * 
     * @see final.json
     * 
     * @return Sorted finalData.
     */
    function sortFinalData(finalData) {
        try {

            let isSwapped = true;

            while (isSwapped) {
                isSwapped = false;
                for (i = 0; i < finalData.length - 1; i++) {

                    if (finalData[i].count < finalData[i + 1].count) {
                        let temp = finalData[i + 1];
                        finalData[i + 1] = finalData[i];
                        finalData[i] = temp;
                        isSwapped = true;
                    }

                    finalData[i].pos = i + 1;
                    finalData[i + 1].pos = i + 2;

                }
            }

            let group_pos = 1;
            let user_pos = 1;

            for (i = 0; i < finalData.length; i++) {

                let elem = finalData[i];

                if (elem.is_user)
                    finalData[i].pos_in_users = user_pos++;
                else
                    finalData[i].pos_in_groups = group_pos++;

            };

            return finalData;

        }
        catch (err) {
            log.e(err.message + " @ " + err.stack);

        }
    }

    /**
     * Gets userData from rawData.
     * 
     * Creates JSON object containing 'name' and 'short_name'
     * 
     * @param {*} rawData JSON of raw data.
     * 
     * @see raw.json (structure of rawData)
     * 
     * @return JSON object.
     */
    function getLoggedUserData(c_user, nodes) {

        let name = "Unknown";
        let short_name = "Unknown";

        for (i = 0; i < nodes.length; i++) {

            let user = nodes[i].messaging_actor;

            if (user.id != c_user) continue;

            name = user.name;
            name = name == "" ? "Unknown" : name;
            short_name = user.short_name;
            short_name = short_name == null ? getShortName(name) : short_name;

            break;

        }

        return {
            name: name,
            short_name: short_name,
            id: c_user
        }

    }

    /**
     * Creates mainData.topUsers.
     * 
     * @param {*} finalData Final data.
     */
    function getTopUsers(finalData) {

        let topUsersTemp = [];
        let topUsers = [];

        for (i = 0, count = 0; i < finalData.length; i++) {
            if (count == 3) break;

            if (finalData[i].is_user) {
                topUsersTemp.push(finalData[i]);
                count++;
            }
        }

        for (i = 0; i < 3; i++) {
            let obj = topUsersTemp[i];

            let short_name = "Unknown";
            let image_url = "img/others/placeholder-user-image.png";
            let count_str = "Nothing";

            if (obj != null) {
                short_name = obj["short_name"];
                image_url = "http://graph.facebook.com/{0}/picture?type=square&height=225".format(obj["fbid"]);
                count_str = obj["count_str"];
            }

            topUsers.push({
                short_name: short_name,
                image_url: image_url,
                count_str: count_str
            });
        }

        return topUsers;
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
                display_name = full_name == "" ? "Unknown" : full_name;
                short_name = user.short_name;
                short_name = short_name == null ? getShortName(display_name) : short_name;

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
                    groupName += i != count - 2 ? "," : "";
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
     * Creates name_tag for groups
     * 
     * @param {*} nodes all_participants.nodes array from a thread object in rawData
     * 
     * @returns {string} Name tag for group.
     */
    function getGroupsNameTag(nodes) {

        let name_tag = "";

        for (i = 0; i < nodes.length; i++) {
            let name = nodes[i].messaging_actor.name;

            if (name != "")
                name_tag += name.toLowerCase() + " ";
        }

        return name_tag;

    }

    /**
     * Creates array of group users
     * 
     * @param {*} nodes all_participants.nodes array from a thread object in rawData
     * 
     * @returns {string} JSON array.
     */
    function getGroupsUsersList(nodes) {

        let users = [];

        for (i = 0; i < nodes.length; i++) {
            let name = nodes[i].messaging_actor.name;

            if (name != "")
                users.push(name);
        }

        return users;

    }

    /**
     * Creates firstname from long user names.
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

    /**
     * Returns whether user has like specified
     * Facebook page.
     * 
     * @param {*} page_id Facebook page id.
     */
    async function hasUserLikedPage(page_id) {

        let url = `https://www.facebook.com/plugins/like.php?href=https%3A%2F%2Fwww.facebook.com%2F${page_id}&width=62&layout=button&action=like&size=large&show_faces=false&share=false&height=65&appId`;
        let html = await http(url, false, null);
        html = html.response;

        if (html == null) return false;

        let parser = new DOMParser();
        doc = parser.parseFromString(html, "text/html");

        let title = $("button[type='submit']", doc).attr("title").toLowerCase();

        return title.indexOf("unlike") != -1;

    }


    /**
     * Shows Facebook share dialog.
     * 
     * @param {*} mainData main.js -> mainData.
     * @returns {*} True on success || False on fail || -1 on no internet.
     */
    async function showFbSharePopup(mainData) {
        try {

            log.l("Cloudinary");

            // If top users array doesn't contain at least 3 users.
            if (mainData.topUsers.length < 3) {
                log.m("CLD", "SUCCEED", "False");
                log.m("CLD", "Not enough users in the topuser list.");
                return false;
            }

            // If top users data updated.
            if (mainData.isTopUsersChanged || imageUrl == "") {

                // Gets base64 uri.
                let id = mainData.loggedUser.id;
                let loggedUserName = mainData.loggedUser.short_name;
                let topUsers = mainData.topUsers;
                let dataUri = await tcCanvas.getCanvasUri(loggedUserName, topUsers);
                if (dataUri == null) {
                    log.w("CLD", "DataUri is NULL.");
                    log.w("CLD", "SUCCEED", "False");
                    return false;
                }
                let file = encodeURIComponent(dataUri);

                // Uploads in Cloudinary.
                let key = "999736996212663";
                let secret = "VYN8L9CnVOrDQ22fjrkyHnbSMRw";
                let timestamp = Math.round((new Date()).getTime() / 1000);
                let signature = SHA1("public_id={0}&timestamp={1}{2}".format(SHA1(id), timestamp, secret));
                let url = "https://api.cloudinary.com/v1_1/rafsun82/image/upload?";
                let postData = "public_id=" + SHA1(id) +
                    "&timestamp=" + timestamp +
                    "&api_key=" + key +
                    "&signature=" + signature +
                    "&file=" + file;

                let response = await tcLoader.http(url, true, postData);
                response = response.response;

                if (response == null) {
                    log.w("CLD", "Response is null.");
                    log.w("CLD", "SUCCEED", "False");
                    return -1;
                }

                imageUrl = JSON.parse(response).secure_url;

            }

            let shareUrl = "https://www.facebook.com/dialog/share?app_id={0}&href={1}&hashtag={2}".format("1937691456443937", imageUrl, "%23TopConvos");
            window.open((shareUrl), "_blank", "height=570,width=760");
            log.m("CLD", "SUCCEED", "True");
            return true;

        }
        catch (err) {
            log.e("CLD", err.message + " @ " + err.stack);
            log.w("CLD", "SUCCEED", "False");
            return false;
        }
    }

    return {
        http: http,
        getAuthTokens: getAuthTokens,
        getRawData: getRawData,
        createMainData: createMainData,
        createUntitledGroupName: createUntitledGroupName,
        hasUserLikedPage: hasUserLikedPage,
        showFbSharePopup: showFbSharePopup
    }

})();