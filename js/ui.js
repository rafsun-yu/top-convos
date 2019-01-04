var tcUi = (function () {

    /** Updates Left and Right panel */
    function updateUi(objFinal) {
        updatePanelRight(objFinal);
        updatePanelLeft(objFinal);
    }

    /** Updates only right panel */
    function updatePanelRight(objFinal) {

        let selTbody = $("#tbl-main tbody");

        selTbody.empty();

        // Appends <tr> Objects in Right panel
        objFinal.forEach(obj => {
            $tr = createTrObj(obj);
            selTbody.append($tr);
        });

    }

    /** Updates only left panel */
    function updatePanelLeft(objFinal) {

        let childrens = $("#div-results-row").children();

        for (i = 0; i < 3; i++)
        {
            let obj = objFinal[i];
            let name = obj["short_name"];
            let url = obj["image_url"];
            let count_str = obj["count_str"];

            // Validates
            if (name === "") name = "Unknown";
            if (url === "") url = "images//error-image.jpg";
            if (count_str === "") count_str = "Nothing"; 

            // Updates
            $("span[class*='col-result-name']", childrens[i]).text(name);
            $("span[class*='col-result-info']", childrens[i]).text(count_str);
            $("span[class*='col-result-img']", childrens[i]).attr("src", url);
        
        }

    }

    /** Creates and Returns a <tr> object created from a element of final.json */
    function createTrObj(obj) {

        let html = "";
        let pos = obj["pos"];
        let name = obj["full_name"];
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
                                        .attr("src", url)
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
    
    return {
        updateUi: updateUi
    }

})();