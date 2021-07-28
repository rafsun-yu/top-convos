var tcUi = (function () {

    subscribeToEvents();

    /** 
     * Updates Left and Right panel.
     */
    async function updateUi(mainData) {
        // Async is added to smooth loading animation.
        await new Promise(resolve => {
            updatePanelRight(mainData.finalData);
            updatePanelLeft(mainData);

            setTimeout(() => {
                resolve();
            }, 1000);
        });
    }

    /** 
     * Updates the right panel.
     * 
     * @requires ui-vue.js -> setVmArray
     * @param {*} finalData final.json.
     */
    function updatePanelRight(finalData) {
        tcUiVue.setVmArray(finalData);
    }

    /** 
     * Updates only left panel.
     */
    function updatePanelLeft(mainData) {

        let loggedUser = mainData.loggedUser;
        let topUsers = mainData.topUsers;
        let childrens = $("#div-results-row").children();

        // Updates html.
        for (i = 0; i < 3; i++) {
            let short_name = topUsers[i].short_name;
            let image_url = topUsers[i].image_url;
            let count_str = topUsers[i].count_str;

            $("span[class*='col-result-name']", childrens[i]).text(short_name);
            $("span[class*='col-result-info']", childrens[i]).text(count_str);
            $("#div-title-main").removeClass("no-info");
            $("span[class*='col-result-name']", childrens[i]).removeClass("no-info");
            $("span[class*='col-result-info']", childrens[i]).removeClass("no-info");
            $("img[class*='col-result-img']", childrens[i]).attr("src", image_url);
        }

        $("#div-title-main span").text("{0}'s top friends".format(loggedUser.short_name));

        if ($("#sec-panel-left-container").css("display") == "none")
            $("#sec-panel-left-container").fadeIn(100);

    }

    /**
     * Subscribe to events.
     */
    function subscribeToEvents() {
        $("#form-filter").trigger("reset");
        $("#form-filter").submit((event) => { event.preventDefault(); });
        $("#btn-search-cross").css("display", "none");
        $(".rd-filter").on("change", onRadioChange);
        $("#btn-search").on("click", onSearchClick);
        $("#tb-search").on("input", onSearchInput);
        $("#tb-search").on("keypress", (event) => {
            if (event.keyCode == 13)
                onSearchClick();
        });
        $("#btn-search-cross").on("click", onSearchCrossClick);
        $("#img-news").on("load", () => {
            $("#div-news").css("display", "flex");
        });
        $("#img-news").on("error", () => {
            $("#div-news").css("display", "none");
        });
        onBrowserTabUpdate();
    }

    /**
     * OnChange: Filter radio buttons.
     */
    function onRadioChange() {
        let filterType = $(this).attr("value");
        tcUiVue.setVmFilterType(filterType);
        onSearchClick();
    }

    /**
     * OnClick: Search button.
     */
    function onSearchClick() {
        let searchString = $("#tb-search").val().trim().toLowerCase();
        tcUiVue.setVmSearchString(searchString);
    }

    /**
     * OnInput: Search textbox.
     */
    function onSearchInput() {
        let val = $("#tb-search").val().trim().toLowerCase();
        let crossDisplay = $("#btn-search-cross").css("display") == "none" ? "none" : "";
        let newCrossDisplay = val == "" ? "none" : "";
        if (newCrossDisplay != crossDisplay)
            $("#btn-search-cross").css("display", newCrossDisplay);
    }

    /**
     * OnClick: Search cross button.
     */
    function onSearchCrossClick() {
        $("#tb-search").val("");
        onSearchInput();
        tcUiVue.setVmSearchString("");
    }

    /**
     * Adds listener to capture tab update event.
     * 
     * This is different from other event handler functions.
     * 
     * @requires Uses browser object of Mozilla JS Api. 
     */
    function onBrowserTabUpdate() {
        browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
            if (tab.url.indexOf("close_popup.php") != -1 || tab.url.indexOf("dialog/return/close") != -1) {
                browser.tabs.remove(tabId);
                $('#modal-support-prompt').modal('hide');
                let iframes = document.getElementsByClassName("fb-like");
                for (i = 0; i < iframes.length; i++) {
                    iframes[i].src = iframes[i].src;
                }
            }
        });
    }

    /**
     * Loads Facebook like iframes.
     */
    function loadIframes() {

        $(".fb-like").attr("scrolling", "no");
        $(".fb-like").attr("frameborder", "0");
        $(".fb-like").attr("allowTransparency", "true");
        $(".fb-like").attr("allow", "encrypted-media");

        $(".fb-like#fb-like-panel").attr("width", "52");
        $(".fb-like#fb-like-panel").attr("height", "20");
        $(".fb-like#fb-like-panel").attr("src", "https://www.facebook.com/plugins/like.php?href=https%3A%2F%2Fwww.facebook.com%2Frafsun82&width=60&layout=button&action=like&size=small&show_faces=false&share=false&height=20&appId");

        $(".fb-like#fb-like-panel").on("load", function () {
            $("#div-fb-like").css("display", "flex");
        });

        $(".fb-like#fb-like-modal").attr("width", "100");
        $(".fb-like#fb-like-modal").attr("height", "36");
        $(".fb-like#fb-like-modal").attr("src", "https://www.facebook.com/plugins/like.php?href=https%3A%2F%2Fwww.facebook.com%2Frafsun82&width=93&layout=button_count&action=like&size=large&show_faces=false&share=false&height=21&");

    }

    /**
     * Updates div-news.
     * 
     * @param {*} news news.json
     */
    function updateDivNews(news) {
        $("#anchor-news").attr("href", news.external_url);
        $("#img-news").attr("src", news.image_url);
    }


    /**
     * Resizes #div-results-main and its elements.
     */
    function resizeTopUsersContainer() {
        let maxViewportH;   // Maximum height of viewport.
        let elemH;          // Height of every elements except #div-results-main.
        let availH;         // Remaining height of #div-results-main.
        let availHX;        // Remaining height of #div-results-main without paddings.
        let imgH;           // Height of image.
        let maxImgH;        // Max height of image.
        let nameS;          // Line height of name container.
        let infoS;          // Line height of info container.
        let minBodyW;       // Minimum width of Body.

        maxViewportH = screen.availHeight - (window.outerHeight - window.innerHeight);
        elemH = $("#sec-header").outerHeight(true) +
            $("#div-support").outerHeight(true) +
            $("#div-title-main").outerHeight(true) +
            $("#div-border").outerHeight(true) +
            $(".div-btn-share").outerHeight(true) +
            115 + 48;
        availH = maxViewportH - elemH;
        availHX = availH - 24;
        imgH = (225 / 280) * availHX;
        maxImgH = ($("#div-results-main-wrapper").outerWidth(true) - 120) / 3;
        imgH = imgH > maxImgH ? maxImgH : imgH;
        nameS = (32 / 280) * availHX;
        infoS = (22 / 280) * availHX;

        if (window.matchMedia('(max-device-width: 480px)').matches)
            minBodyW = "100%";
        else {
            minBodyW = ((3 * imgH) + 120) + $("#sec-panel-right").outerWidth(true);
            let tmpW = 610+40+$("#sec-panel-right").outerWidth(true);
            if (minBodyW < tmpW) minBodyW = tmpW;
            minBodyW = minBodyW + "px";
        }
        
        $("#div-results-main-wrapper").height(availH);

        $("body").css({
            "min-width": minBodyW
        });

        $(".col-result-img").css({
            "width": imgH + "px",
            "height": imgH + "px"
        })

        $(".col-result-name").css({
            "font-size": nameS + "px",
            "line-height": nameS + "px",
            "height": nameS + "px",
            "width": imgH + "px",
        })

        $(".col-result-info").css({
            "font-size": infoS + "px",
            "line-height": infoS + "px",
            "height": infoS + "px",
            "width": ((175 / 280) * availHX) + "px",
        })

        $("#img-news").css({
            "width": "610px",
            "height": "115px"
        });

    }

    return {
        updateUi: updateUi,
        loadIframes: loadIframes,
        resizeTopUsersContainer: resizeTopUsersContainer,
        updateDivNews: updateDivNews
    }

})();