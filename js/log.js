var log = (function() {

    let strlog = "";
    let onConsole = false; // Should write on browsers console?

    // Writes on the strlog
    function write(line) {

        if (onConsole) 
            console.log(line);

        strlog += line + "\n";
    }

    // Creates single line log from rest parameter
    function logx(type, args) {

        let line = "["+type+"] ";

        for(i = 0; i < args.length; i++) {
            
            if (i != args.length -1)
                line += "[" + args[i] + "] ";
            else
                line += args[i];

        }

        write(line);
    }

    // Error: Uncaught errors. Logged when system error occurrs.
    function e(...args) {
        logx("ERR", args);
    }

    // Message: General log. Always logged. Don't put in if statements.
    function m(...args) {
        logx("MSG", args);
    }

    // Warning: Caught errors and exceptions. Only logged when the exception is arised.
    function w(...args) {
        logx("WAR", args);
    }

    // Locator (Calling function details)
    function l(msg) {
        let line = "\n[--- " + msg + " ---]";
        write(line);
    }

    // Clears and resets strlog
    function clear() {
        strlog = "";
        line = "[VER] " + browser.runtime.getManifest().version;
        write(line);
    }

    // Resets strlog
    function init() {
        clear();
    }

    // Returns strlog
    function get() {
        return strlog;
    }

    // Sets onConsole
    function setOnConsole(bool) {
        onConsole = bool;
    }

    return {

        e: e,
        m: m,
        w: w,
        l: l,
        setOnConsole: setOnConsole,
        clear: clear,
        init: init,
        get: get

    }

})();