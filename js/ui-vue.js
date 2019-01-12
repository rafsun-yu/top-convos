var tcUiVue = (function () {

    let vmArray = [];

    let vm = new Vue({
        data: {
            arr: vmArray,
            filterType: "users groups",
            searchString: ""
        },
        methods: {
            getDisplayStyle: getDisplayStyle,
            getActualPos: getActualPos,
            getDecorationClass: getDecorationClass,
            getHighlightedName: getHighlightedName
        }
    });

    function setVmArray(finalData) {



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
        return { "'${className}'": actualPos <= 3 ? true : false};
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

        // If no search filter
        if (this.searchString == "")
            html = name;

        // If matched by name and name is not custom.
        // Inserts highlighter-class for the matched part only.
        else if (matchIndexName != -1 && !a.custom_name) {
            html = name.slice(0, matchIndexName);
            html += "<span class='mark'>";
            html += name.slice(matchIndexName, matchIndexName+searchStringLen);
            html += "</span>";
            html += name.slice(matchIndexName+searchStringLen);
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
        setVmArray: setVmArray
    }

})();