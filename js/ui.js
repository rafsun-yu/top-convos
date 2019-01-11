var tcUi = (function () {

    // Search string in the searchbox.
    let filterString = "";
    // Posible values of filterType are: both, users and groups.
    let filterType = "both";
    // This is a local copy of finalData and userData.
    let localFinalData = [];
    let localUserData = {};
    // Filtered version of localFinalData. Filtered from types.
    let filteredFinalData = [];

    /** 
     * Updates Left and Right panel.
     * 
     * This function modifies html.
     *
     * @requires updatePanelLeft
     * @requires updatePanelRight
     *  
     */
    function updateUi() {

        // Panel right
        filterFinalDataByType();
        updatePanelRight(sortFinalData(filteredFinalData));

        // Panel left
        updatePanelLeft(localUserData, localFinalData);
    }

    /** 
     * Updates only right panel 
     * 
     * This function is called by updateUi
     */
    function updatePanelRight(finalData) {

            /* $("#tbl-main tbody").fadeOut(100);
            $("#tbl-main tbody").remove();

            let tbody = $(document.createElement("tbody")).css("display", "none");
            for(i = 0; i < finalData.length; i++) {

                let obj = finalData[i];
                tbody.append( createTrObj(obj));

            }

            $("#tbl-main").append(tbody);
            tbody.fadeIn(100); */

            let html = "";
            for(i = 0; i < finalData.length; i++) {

                let obj = finalData[i];
                html += ( createTrObjX(obj));

            }
            $("#tbl-main tbody").html(html);
             
    }


    /** 
     * Updates only left panel.
     *
     * This function is called by updateUi. 
     */
    function updatePanelLeft(userData, finalData) {

        let childrens = $("#div-results-row").children();

        // Filters out groups
        let topUsers = [];
        for(i = 0, count = 0; i < finalData.length; i++) {

            if (count == 3) break;

            if (finalData[i].is_user) {

                topUsers.push(finalData[i]);
                count++;

            }
        } 

        // Updates html
        for (i = 0; i < 3; i++)
        {
            let obj = topUsers[i];

            let name = "Unknown";
            let url = "images//error-image.jpg";
            let count_str = "Nothing"; 

            if (obj != null) {

                name = obj["short_name"];
                url = "http://graph.facebook.com/{0}/picture?type=square&height=225".format(obj["fbid"]);
                count_str = obj["count_str"];

            }
            
            $("span[class*='col-result-name']", childrens[i]).text(name);
            $("span[class*='col-result-info']", childrens[i]).text(count_str);
            $("img[class*='col-result-img']", childrens[i]).attr("src", url);
        
        }

        $("#div-title-main span").text("{0}'s top friends".format(userData.short_name));

        if ($("#sec-panel-left-container").css("display") == "none")
            $("#sec-panel-left-container").fadeIn(100);

    }

    function createTrObjX(obj) {

        let pos = obj["pos"];
        let name = obj["name"];
        let url = obj["image_url"];
        let count_str = obj["count_str"];
        let class_td_pos = "td-pos";

        // Colors <td.td-pos> for first, second and third <tr>
        switch (pos) {
            case 1:
                class_td_pos += " color-gold";
                break;

            case 2:
                class_td_pos += " color-silver";
                break;

            case 3:
                class_td_pos += " color-bronze";
                break;
        }

        // Validates
        if (name === "") name = "Unknown";
        if (url === "") url = "images//error-image.jpg";
        if (count_str === "") count_str = "Nothing";

        // Creates obj
        let html = "";
        html += "<tr class='tr-main'>";
        html += "<td class='{0}'>{1}</td>".format(class_td_pos,pos);
        html += "<td class='td-content'>";
        html += "<img class='td-content-img' src='{0}' height='54px'>".format(url);
        html += "<div class='td-content-texts'>";
        html += "<span class='td-content-texts-name'>{0}</span>".format(name);
        html += "<span class='td-content-texts-info'>{0}</span>".format(count_str);
        html += "</div>"; // End of div.td-content-texts
        html += "</td>"; // End of td content
        html += "</tr>";
        //html += ;

        return html;
        
    }

    /** 
     * Creates <tr> object out of an element of finalData.
     * 
     * @returns <tr> object which can be appened in <tbody>.
     */
    function createTrObj(obj) {

        let pos = obj["pos"];
        let name = obj["name"];
        let url = obj["image_url"];
        let count_str = obj["count_str"];
        let class_td_pos = "td-pos";

        // Colors <td.td-pos> for first, second and third <tr>
        switch (pos) {
            case 1:
                class_td_pos += " color-gold";
                break;

            case 2:
                class_td_pos += " color-silver";
                break;

            case 3:
                class_td_pos += " color-bronze";
                break;
        }

        // Validates
        if (name === "") name = "Unknown";
        if (url === "") url = "images//error-image.jpg";
        if (count_str === "") count_str = "Nothing";

        // Creates obj

        // tr-main
        let $tr = $(document.createElement("tr"))
                        .attr("class","tr-main")
                        // td-pos
                        .append ( 
                            $(document.createElement("td")) 
                                .attr("class",class_td_pos)
                                .text("#" + pos)
                        )
                        // td-content
                        .append ( 
                            $(document.createElement("td"))
                                .attr("class","td-content")
                                // td-content-img
                                .append (
                                    $(document.createElement("img"))
                                        .attr("class", "td-content-img")
                                        .attr("src", "images/error-image.jpg")
                                        .attr("data-src", url)
                                        .attr("height", "54px")
                                )
                                // td-content-texts
                                .append ( 
                                    $(document.createElement("div"))
                                        .attr("class", "td-content-texts")
                                        // td-content-texts-name
                                        .append ( 
                                            $(document.createElement("span"))
                                                .attr("class", "td-content-texts-name")
                                                .text(name)
                                        )
                                        // td-content-texts-info
                                        .append (
                                            $(document.createElement("span"))
                                                .attr("class", "td-content-texts-info")
                                                .text(count_str)
                                        ) 
                                ) 
                        );

        return $tr;

    }

    /**
     * Sorts finalData in ascending order.
     * 
     * @param {*} finalData Generated from loader.js:createFinalData
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
                for(i = 0; i < finalData.length-1; i++) {

                    if (finalData[i].count < finalData[i+1].count) {
        
                        let temp = finalData[i+1];
                        finalData[i+1] = finalData[i];
                        finalData[i] = temp;
                        isSwapped = true;
                    }
        
                    finalData[i].pos = i+1;
                    finalData[i+1].pos = i+2;
        
                }

            }

            return finalData;
        }
        catch (err) {

            log.e(err.message + " @ " + err.stack);

        }
        

    }

    /**
     * Sets localFinalData.
     * 
     * This functions needs to be called before any other
     * functions from this file.
     * 
     * @see final.json
     * 
     * @param {*} finalData Final data.
     */
    function setFinalData(userData, finalData) {
        localUserData = userData;
        localFinalData = sortFinalData(finalData);
        filteredFinalData = localFinalData;
    }

    /**
     * Modifies filteredFinalData by filter type.
     */
    function filterFinalDataByType() {

        filterString = "";
        filteredFinalData = [];
        for(i = 0; i < localFinalData.length; i++) {

            let t = localFinalData[i];

            if (filterType == "users" && t.is_user == false)
                continue;

            if (filterType == "groups" && t.is_user == true)
                continue;

            filteredFinalData.push(t);

        }

    }

    /**
     * Hides tr elements in the right panel which doesn't 
     * match the search string.
     * 
     * This function doesn't modify filteredFinalData.
     */
    function filterFinalDataBySearch() {

        $("#tbl-main tbody").hide();

        if (filterString == "") {
             /* for(i = 0; i < filteredFinalData.length; i++) {
                let name = filteredFinalData[i].name;
                $(".tr-main:nth-child("+(i+1)+")").children().fadeIn(100);
                $(".tr-main:nth-child("+(i+1)+") .td-content-texts-name").html(name);
            }  */
            return;

        }

        let filterStringL = filterString.toLowerCase();

        for(i = 0; i < filteredFinalData.length; i++) {

            let is_user = filteredFinalData[i].is_user;
            let name = filteredFinalData[i].name;
            let name_tag = filteredFinalData[i].name_tag;
            let matchIndexNameTag = name_tag.indexOf(filterStringL);
            let matchIndexName = name.toLowerCase().indexOf(filterStringL);
            let filterStringLen = filterString.length;
            let tableRows = $("#tbl-main tbody").children();

            if (matchIndexName != -1 || (!is_user && matchIndexNameTag != -1)) {

                let html;
                html = name.slice(0, matchIndexName);
                html += "<span class='mark'>";
                html += name.slice(matchIndexName, matchIndexName+filterStringLen);
                html += "</span>";
                html += name.slice(matchIndexName+filterStringLen);

                /* if (matchIndexName != -1)
                    $(".tr-main:nth-child("+(i+1)+") .td-content-texts-name").html(html);
                else 
                    $(".tr-main:nth-child("+(i+1)+") .td-content-texts-name").html(name);

                $(".tr-main:nth-child("+(i+1)+")").children().fadeIn(100); */

                $(tableRows[i]).show();
            }
            else {

                $(tableRows[i]).hide();

            }

        }

        $("#tbl-main tbody").show();

    }

    // Emits when filter-type (radio button) changes.
    $(".rd-filter").on("change", async function () {

        filterType = $(this).attr("value");
        filterFinalDataByType();
        await updatePanelRight(sortFinalData(filteredFinalData));

    });

    // Emits when data is being input in search textbox.
    $("#btn-search").on("click", function () {

        let filterStringNew = $("#tb-search").val().trim();

        if (filterStringNew == filterString)
            return;

        filterString = filterStringNew;
        filterFinalDataBySearch();

    });

    return {
        updateUi: updateUi,

        sortFinalData: sortFinalData,

        setFinalData: setFinalData
    }

})();