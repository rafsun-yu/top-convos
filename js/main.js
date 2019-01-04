(async function () {

    log.setOnConsole(true);
    log.init();

     let objFinal = null; // final.json

    objFinal = await tcLoader.loadObjFinalFromLocal();
    tcUi.updateUi(objFinal);

    tcLoader.getAuthTokens()

})();