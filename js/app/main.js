/* var isTesting = true; */

(async function () {

    let mainData, state, hasLikedDevPage, isPromptedForLike;

    initMain();

    /**
     * Initializes log, state and mainData. 
     */
    function initMain() {

        // Inits log.
        log.setOnConsole(false);
        log.init();

        // Loading settings.
        $("#div-loading").css("width", $("body").css("width"));
        $("#div-loading").css("height", $("body").css("height"));
        $("#div-loading").css("display", "none");

        // Resets cache iframe (to avoid Firefox bug).
        $("iframe").attr("src", "");

        // Sets default mainData.
        mainData = {
            authTokens: {
                fb_dtsg: null,
                c_user: null
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

        // Sets current loading state. Values: "idle", "loading".
        state = "idle";

        // Facebook like prompt.
        hasLikedDevPage = false;
        isPromptedForLike = false;

        // Shows loading by default.
        state = "loading";
        showLoading(true);

        // Subscribe to events.
        subscribeToEvents();
    }

    /**
     * Starts loading mainData (and optionally authTokens)
     * 
     * @param {*} shouldIncludeAuthTokens Whether to load authTokens too.
     */
    async function refreshData(shouldIncludeAuthTokens) {

        // Shows loading animation.
        state = "loading";
        await showLoading(true); $('.toast').toast('show')

        // **TESTING**
        /* if (isTesting) {
            mainData.authTokens = {};
            mainData.authTokens.c_user = "714995285";
            mainData.authTokens.fb_dtsg = "AQFe5txmxwqY%3AAQEezGONuKpb";
        } */

        // **TESTING**
        // Loads authTokens (if required).
        if (/* !isTesting && */ shouldIncludeAuthTokens || mainData.authTokens == null || mainData.authTokens.fb_dtsg == null) {

            mainData.authTokens = await tcLoader.getAuthTokens();

            if (mainData.authTokens == null) {
                showError("You aren't logged in or the authentication data cannot be retrieved.");
                return;
            } else if (mainData.authTokens == -1) {
                showError("Unable to connect to the internet.");
                return;
            }

        }

        // Loads rawData.
        let rawData = await tcLoader.getRawData(mainData.authTokens);
        if (rawData == null) {
            showError("Cannot read received data.");
            return;
        } else if (rawData == -1) {
            showError("Unable to connect to the internet.");
            return;
        }

        // Sets mainData from rawData.
        tempMainData = tcLoader.createMainData(mainData.authTokens.c_user, rawData);
        let isTopUsersChanged = JSON.stringify(mainData.topUsers) != JSON.stringify(tempMainData.topUsers);
        mainData.finalData = tempMainData.finalData;
        mainData.loggedUser = tempMainData.loggedUser;
        mainData.topUsers = tempMainData.topUsers;
        mainData.isTopUsersChanged = isTopUsersChanged;

        // Updates interface.
        await tcUi.updateUi(mainData);

        // Hides loading animation.
        await showLoading(false);
        state = "idle";

        // Prompts support modal.
        setTimeout(() => {
            if (!hasLikedDevPage && !isPromptedForLike) {
                $('#modal-support-prompt').modal('show');
                isPromptedForLike = true;
            }
        }, 2000);
    }

    /**
     * Shows or hide loading animation.
     * 
     * @param {*} bool Whether to show.
     */
    async function showLoading(bool) {
        await new Promise(resolve => {
            if (bool)
                $("#div-loading").fadeIn(200, resolve);
            else
                $("#div-loading").fadeOut(200, resolve);
        });
    }

    /**
     * Shows an error message in popup.
     * 
     * @param {*} msg Message.
     */
    function showError(msg) {

        showLoading(false);
        state = "idle";

        let logHrefData = window.URL.createObjectURL(new Blob([log.get()], { type: 'text/plain' }));
        let fileName = "topconvos-log-{0}-{1}".format(
            mainData.authTokens == null || mainData.authTokens.c_user == null ? "NULL" : mainData.authTokens.c_user,
            Date.now());

        $("#btn-modal-error-log-download").attr("download", fileName).attr("href", logHrefData);
        $("#modal-error-msg").text(msg);

        $("#modal-error").modal('show');
        
    }

    /**
     * Subscribes to events.
     */
    function subscribeToEvents() {

        // OnClick: Reload button.
        $("#btn-header-reload").on("click", async function () {
            if (state == "loading") return;
            log.l("<<< REFRESH >>>");
            await refreshData(false);
        });

        // OnClick: Terms button.
        $("#btn-header-terms").on("click", function () {
            window.open("html/terms-policy.html", "_blank");
        });

        // OnClick: About button.
        $("#btn-header-about").on("click", function () {
            window.open("html/about.html", "_blank");
        });

        // OnClick: Share button.
        $(".div-btn-share").on("click", async function () {
            if ($(".div-btn-share").hasClass("disabled")) return;

            $(".btn-share-loading").attr("hidden", false);
            $(".div-btn-share").addClass("disabled");

            let isSucceed = await tcLoader.showFbSharePopup(mainData);
            if (isSucceed == false) {
                showError("Cannot to create share dialog.");
            } else if (isSucceed == -1) {
                showError("Unable to connect to the internet.");
            } else {
                mainData.isTopUsersChanged = false;
            }

            $(".div-btn-share").removeClass("disabled");
            $(".btn-share-loading").attr("hidden", true);
        });

        // OnClick: No Thanks button.
        $("#btn-no-thanks").on("click", function () {
            $('#modal-support-prompt').modal('hide');
            isPromptedForLike = true;
        });

        // OnLoad: Window.
        window.onload = async function () {
            // Loading Facebook Like iframes.
            new Promise(async resolve => {
                let result = await tcLoader.hasUserLikedPage("rafsun82");
                resolve(result);
            }).then(result => {
                hasLikedDevPage = result;
                if (!hasLikedDevPage) {
                    tcUi.loadIframes();
                }
            });

            // Loading news
            new Promise(async resolve => {
                let url = "https://dl.dropboxusercontent.com/s/kxc5etitxqdcz26/news.json";
                let result = await tcLoader.http(url, false, null);
                resolve(result.response);
            }).then(result => {
                try {
                    let news = JSON.parse(result);

                    if (news.show_news)
                        tcUi.updateDivNews(news);
                }
                catch(err) {
                    log.e("MAIN", "NEWS", err.message);
                }
            });

            tcUi.resizeTopUsersContainer();
            await refreshData(true);
        };
    }

})();