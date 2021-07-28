var tst = (function () {
    log.setOnConsole(true);
    log.init();

    var m = {response: null}
    console.log(m.response)

    mainData = {
        authTokens: {
            fb_dtsg: "AQHsTNIJk-yn%3AAQHGuJ7DvFxE",
            c_user: "100012214833676"
        },
        loggedUser: {
            name: null,
            short_name: null,
            id: null
        },
        finalData: [],
        topUsers: [],
        isTopUsersChanged: true
    }

    async function load() {

        let data = await getRawData(mainData.authTokens);
        $("#t-data").val(JSON.stringify(data));
    }

    async function getRawData(authTokens) {
        try {

            log.l("RawData");

            let tempJson, tempThreads, postData, json, status, lastIndex;
            let finalJson = {"o0":{"data":{"viewer":{"message_threads":{"nodes":[]}}}}};
            let finalThreads = finalJson.o0.data.viewer.message_threads.nodes;
            let url = "https://www.facebook.com/api/graphqlbatch/";
            let perRequest = 500;
            let before = null;
            let totalThreads = 0;
            let loadedThreads = 0;
            let attempts = 0;

            while (1) {
                attempts++;
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
                    log.m("Attempts", attempts, "Status 500");
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

                for((attempts == 1 ? i = 0: i = 1); i < tempThreads.length; i++) {
                    finalThreads.push(tempThreads[i]);
                    totalThreads++;
                    if (i == tempThreads.length-1)
                        before = tempThreads[i].updated_time_precise;
                }

                // End loop
                if (loadedThreads < perRequest) {
                    log.m("Loaded", totalThreads);
                    break;
                }

                // Restore perRequest
                if (perRequest * 2 <= 1000)
                    perRequest *= 2;
            }
            


            log.m("JSON string length: " + json.length);

            return (finalJson);

        }
        catch (err) {

            log.e(err.message + " @ " + err.stack);
            return null;

        }
    }

    load();

    return {
        load: load
    }

})();