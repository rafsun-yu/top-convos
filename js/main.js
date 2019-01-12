(async function () {

    // Inits log.
    log.setOnConsole(true);
    log.init();
    $("#sec-panel-left-container").hide();

    // JSON object containing 'fb_dtsg' and 'c_user' keys.
    let authTokens = null;

    // JSON object containing loggedin users data. 'name'.
    let userData = null;

    // FINAL_JSON object. See final.json.
    let finalData = null;

    // Aplications current state. Values: "idle", "loading".
    let state = "idle";

    // Emits when window is loaded.
    window.onload = async function() {

        //showLoading(false);
        await refreshData(true);

    };

    /**
     * Starts loading finalData (and optionally authTokens)
     * 
     * @param {*} shouldIncludeAuthTokens Whether to load authTokens too.
     */
    async function refreshData(shouldIncludeAuthTokens) {

        state = "loading";

        // REMOVE BELOW
        authTokens = {};
        authTokens.c_user = "100012214833676";
        authTokens.fb_dtsg = "F";

/*         showLoading(true);

        if (shouldIncludeAuthTokens || authTokens == null || authTokens.fb_dtsg == null) {

            authTokens = await tcLoader.getAuthTokens();

            if (authTokens == null) {
                showError("Unable to parse the authentication data .Please be sure you are logged in.");
                return;
            } else if (authTokens == -1) {
                showError("Unable to connect to the internet.");
                return;
            }

        } */

        let rawData = await tcLoader.getRawData(authTokens);
        
        if (rawData == null) {
            showError("Cannot read or process received data.");
            return;
        } else if (rawData == -1) {
            showError("Unable to connect to the internet.");
            return;
        }

  

        userData = tcLoader.getUserData(authTokens.c_user, rawData);
        finalData = tcLoader.createFinalData(rawData);

        tcUi.setFinalData(userData, finalData);
        tcUi.updateUi();

        showLoading(false);

        state = "idle";

    }

    function showLoading(bool) {

        if (bool)
            $("#div-loading").fadeIn(200);
        else 
            $("#div-loading").fadeOut(200);

    }

    function showError(msg) {

        showLoading(false);
        state = "idle";

        let logHrefData = window.URL.createObjectURL(new Blob([log.get()], {type: 'text/plain'}));
        let fileName = "topconvos-log-{0}-{1}".format(
                            authTokens == null || authTokens.c_user == null ? "NULL" : authTokens.c_user, 
                            Date.now());

        let $p = $(document.createElement("p")).text(msg);
        let $p_reporter = $(document.createElement("p"))
                    .css("text-align", "center")
                    .css("padding-top", "16px")
                    .css("color", "Gray")
                    .css("font-size", "12px")
                    .text("If you think a bug caused this error, please send the log file to the developer.")
                    .append($(document.createElement("br")))
                    .append($(document.createElement("a"))
                        .attr("download", fileName)
                        .attr("href", logHrefData)
                        .text("Download log")
                    );

        let $modal_body = $('#my-modal .modal-body');
        $modal_body.empty();
        $modal_body.append($p);
        $modal_body.append($p_reporter);

        $("#my-modal #my-modal-title").text("Alert");
        $('#my-modal').modal('show');

    }


    $("#btn-header-reload").on("click", async function () {

        if (state == "loading") return;

        await refreshData(false);

    });

    $("#btn-header-terms").on("click", function () {

        window.open("rules.html", "_blank");

    });

    $("#btn-header-about").on("click", function () {

        window.open("about.html", "_blank");

    });

})();