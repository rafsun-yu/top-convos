(async function () {

    // Inits log.
    log.setOnConsole(true);
    log.init();

    // JSON object containing 'fb_dtsg' and 'c_user' keys.
    // ON_PRODUCTION: let authTokens = null;
    let authTokens = { fb_dtsg: "AQHCoK7xgIZp%3AAQHv3MiAFWm_", c_user: "100010086031027" };
    // FINAL_JSON object. See final.json.
    let objFinal = null; 

    // Emits when window is loaded.
    window.onload = async function() {

        let rawData = await tcLoader.getRawData(authTokens);
        objFinal = tcLoader.createFinalData(rawData);
        
        tcUi.updateUi(objFinal);

        

    };

})();