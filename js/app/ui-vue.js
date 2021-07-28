var tcUiVue = (function () {

    // A copy of finalData. This array is modified
    // to update Vue's virtual dom.
    let vmArray = [];

    // A .td-content-group-users element which is also
    // a parent of the current tooltip.
    let currentTooltipsParent;

    let vm = initVueInstance();
    let lazyImageObserver = initLazyImageObserver();

    /**
     * Initializes Vue instance and subscribes to some events.
     */
    function initVueInstance() {

        $("body").on("click", hideTooltip);

        return new Vue({
            el: "#div-tbl-main",
            data: {
                arr: vmArray,
                filterType: "users groups",
                searchString: ""
            },
            methods: {
                showTooltip: showTooltip,
                setImageObserver: setImageObserver,
                getDisplayStyle: getDisplayStyle,
                getActualPos: getActualPos,
                getDecorationClass: getDecorationClass,
                getHighlightedName: getHighlightedName
            },
            updated: setImageObserver
        });

    }

    /**
     * Initializes lazyImageObserver.
     * 
     * It is an instance of IntersectionObserver. <img> elements
     * with data-src attribute are passed in the observe function
     * of this instance. When the <img> gets inside the viewport,
     * its src is set to data-src. Thus, <img> media is only loaded
     * when it is inside viewport.
     * 
     */
    function initLazyImageObserver() {

        if ("IntersectionObserver" in window) {
            return new IntersectionObserver(function (entries, observer) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        let lazyImage = entry.target;
                        lazyImage.src = lazyImage.dataset.src;
                        lazyImage.onerror = function () {
                            lazyImage.src = "img//others//placeholder-user-image.png";
                            lazyImageObserver.unobserve(lazyImage);
                        };
                        lazyImageObserver.unobserve(lazyImage);
                    }
                });
            });
        }

        return null;

    }

    /**
     * Sets the vm's data.arr from finalData.
     * 
     * This function removes all elements from data.arr
     * then pushes all elements of finalData in it.
     * 
     * @param {*} finalData JSON Object of final.json.
     */
    function setVmArray(finalData) {

        if (!lazyImageObserver)
            log.w("UiVue", "'IntersectionObserver' not present in 'window'. 'lazyImageObserver' not initialized.");

        // Removes all elements from vmArray
        while (vmArray.length > 0) {
            vmArray.pop();
        }

        // Adds all elements of finalData in vmArray.
        // Before that, it creates a copy of finalData, so that actual data remain unchanged.
        let finalDataCopied = finalData.slice();
        while (finalDataCopied.length > 0) {
            vmArray.push(finalDataCopied.shift());
        }
    }

    /**
     * Sets data.searchString.
     * 
     * @param {*} searchString String from search textbox.
     */
    function setVmSearchString(searchString) {
        if (vm.searchString != searchString)
            vm.searchString = searchString;
    }

    /**
     * Sets data.filterType.
     * 
     * @param {*} searchString Filter-type string from filter radio.
     */
    function setVmFilterType(filterType) {
        if (vm.filterType != filterType)
            vm.filterType = filterType;
    }

    /**
     * Binds lazyImageObserver to a td-content-img element.
     * 
     * Binding occurrs when default 'not-found' image is loaded.
     * This functions is called when dom elements (td-content-img) are
     * updated by vue.
     * 
     * @param {*} event 
     * @param {*} elem Parent element.
     */
    function setImageObserver() {

        // Set observer to all images.
        $(".td-content-img").each(function(index) {
            let target = $(this)[0];
            let src = target.src;
            let datasrc = target.dataset.src;
            if (lazyImageObserver) {
                if (src.indexOf(datasrc) == -1 ){
                    lazyImageObserver.observe(target);
                } 
            }
        });  
    }

    /**
     * Shows tooltip on .td-content-group-users.
     * 
     * Tooltip contains list of all users of the specified
     * <li> element's group-type thread.
     * 
     * @param {*} event 
     * @param {*} users final.json -> elem.users.
     */
    function showTooltip(event, users) {

        if (currentTooltipsParent) return;

        // Creates tooltip title as html.
        let title = "";
        let usersNames = "";
        users.forEach(userName => {
            usersNames += userName + "<br>";
        })
        title = "<div class='div-tooltip'>{0}</div>".format(usersNames);

        // Shows the tooltip 30ms later to prevent getting hidden
        // on other element's onclick event.
        setTimeout(() => {
            currentTooltipsParent = $(event.target);

            currentTooltipsParent
                .tooltip({
                    html: true,
                    boundary: $("#div-tbl-main"),
                    placement: "left",
                    delay: { hide: "200" },
                    title: title
                })

                // Subscribes a tooltip.mouseleave event, to hide the tooltip 
                // in case it was prevented from being hidden before.
                .on("shown.bs.tooltip", function () {
                    $($(".div-tooltip")[0]).on("mouseleave", function () {
                        setTimeout(() => {
                            currentTooltipsParent.tooltip("hide");
                        }, 200);
                    });
                })

                // Prevent tooltip from being hidden when mouse is over.
                .on("hide.bs.tooltip", function () {
                    return $(".div-tooltip:hover").length == 0;
                })

                // Dispose tooltip on hidden.
                .on("hidden.bs.tooltip", function () {
                    if (currentTooltipsParent) {
                        currentTooltipsParent.tooltip('dispose');
                        currentTooltipsParent = null;
                    }
                });

            currentTooltipsParent.tooltip('show');
        }, 30);

    }

    /**
     * Hides currently visible tooltip.
     * 
     * Parent of the currently visible tooltip
     * is referred in currentTooltipsParent.
     * 
     */
    function hideTooltip() {
        if (currentTooltipsParent)
            currentTooltipsParent.tooltip('hide');
    }

    /**
     * Returns css.display style of an elem in html.list.
     * 
     * This is decided based on the filter options.
     * 
     * @param {*} elem An element of finalData.
     * @returns {*} "none" for hidden. "" for visible.
     */
    function getDisplayStyle(elem) {

        let displayStyle = "";

        // if elem = user and filterType = group
        if (elem.is_user && this.filterType.indexOf("user") == -1)
            displayStyle = "none";

        // if elem = group and filterType = user
        else if (!elem.is_user && this.filterType.indexOf("groups") == -1)
            displayStyle = "none";

        // filters based on searchString
        else if (this.searchString != "") {
            let isMatchByName = (elem.name.toLowerCase().indexOf(this.searchString) != -1);
            let isMatchByNameTag = (elem.name_tag.indexOf(this.searchString) != -1);
            // isMatchByName is only acceptable when elem.name is not set by the script.
            displayStyle = (isMatchByName && !elem.custom_name) || isMatchByNameTag ? "" : "none";
        }

        // if no searchString is set
        else if (this.searchString == "")
            displayStyle = "";

        // if filterType = both
        else
            displayStyle = "";

        return displayStyle;

    }

    /**
     * Returns the actual position of an elem in html.list.
     * 
     * Actual position of an elem changes when filterType changes.
     * For example, when filterType is "users", the actual position
     * is the position among the users only, groups are excluded.
     * 
     * @param {*} elem  An element of finalData.
     * @returns {*} Actual position.
     */
    function getActualPos(elem) {

        let actualPos = elem.pos;

        if (this.filterType == "users" && elem.is_user)
            actualPos = elem.pos_in_users;
        else if (this.filterType == "groups" && !elem.is_user)
            actualPos = elem.pos_in_groups;

        return actualPos;

    }

    /**
     * Returns the html class for td-pos for decoration.
     * 
     * These classes change css.color and css.fontWeight of first, 
     * second and third elem.
     * 
     * @param {*} elem An element of finalData.
     * @returns {*} An object which is passed in v-bind:class
     *              to bind specified class to the elem.
     */
    function getDecorationClass(elem) {

        let actualPos = this.getActualPos(elem);
        let className = "color-gold";

        switch (actualPos) {
            case 1:
                className = "color-gold";
                break;

            case 2:
                className = "color-silver";
                break;

            case 3:
                className = "color-bronze";
                break;

            default:
                className = "color-gold";
                break;
        }

        // Only binds the class when actualPos is between 1 ~ 3.
        let bindingObj = {};
        bindingObj[`${className}`] = actualPos <= 3 ? true : false;

        return bindingObj;
        
    }

    /**
     * Returns the modified HTML string of td-content-texts-name.
     * 
     * When search is involved, matched part of the string is highlighted.
     * This function inserts <span> and class to highlight matched part 
     * inside the actual string.
     * 
     * @param {*} elem An element of finalData.
     * @returns {*} HTML string. Plain text when no modification is made.
     */
    function getHighlightedName(elem) {

        let html = "";
        let name = elem.name;
        let name_tag = elem.name_tag;
        let matchIndexNameTag = name_tag.indexOf(this.searchString);
        let matchIndexName = name.toLowerCase().indexOf(this.searchString);
        let searchStringLen = this.searchString.length;

        // If no search filter.
        if (this.searchString == "")
            html = name;

        // If matched by name and name is not custom.
        // Inserts highlighter-class for the matched part only.
        else if (matchIndexName != -1 && !elem.custom_name) {
            html = name.slice(0, matchIndexName);
            html += "<span class='mark'>";
            html += name.slice(matchIndexName, matchIndexName + searchStringLen);
            html += "</span>";
            html += name.slice(matchIndexName + searchStringLen);
        }

        // If matched by name_tag (must be a group).
        // Inserts highlighter-class for the whole string.
        else if (matchIndexNameTag != -1) {
            html += "<span class='mark'>";
            html += name;
            html += "</span>";
        }

        else
            html = name;

        return html;

    }

    return {
        vm: vm,
        setVmArray: setVmArray,
        setVmSearchString: setVmSearchString,
        setVmFilterType: setVmFilterType
    }

})();