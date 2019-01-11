

    /** string.format */
    if (!String.prototype.format) {
        String.prototype.format = function() {
          var args = arguments;
          return this.replace(/{(\d+)}/g, function(match, number) { 
            return typeof args[number] != 'undefined'
              ? args[number]
              : match
            ;
          });
        };
      }

function isValidJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function addCommasInNumber(num) {

    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

}

// 
function changeLoadingIconToWaiting(bool) {

    if (bool) {

        if (!$("#img-loading").hasClass("loader-gray")) {
            $("#img-loading").removeClass("loader-blue");
            $("#img-loading").addClass("loader-gray");
        }

    }
    else {

        if (!$("#img-loading").hasClass("loader-blue")) {
            $("#img-loading").removeClass("loader-gray");
            $("#img-loading").addClass("loader-blue");
        }

    }

}
