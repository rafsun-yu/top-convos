var tcCanvas = (function () {

    let canvas = null;
    let ctx = null;
    let data = null;
    let totalImageLoaded = null;

    /**
     * Creates base64 data uri for share dialog.
     * 
     * Creates a canvas in memory. Draws on that canvas. 
     * Prodcues base64 data uri of that canvas.
     * 
     * @param {*} loggedUsersName Name of the logged in user.
     * @param {*} topUsers Top three finalData element, excluding groups.
     * @return {*} base64 string || Null on error.
     */
    async function getCanvasUri(loggedUsersName, topUsers) {
        try {
            initdata(loggedUsersName, topUsers);
            await drawImages();
            drawTexts();
            return createBase64();
        }
        catch(err) {
            log.e("CANVAS", err.message + " @ " + err.stack);
            dispose();
            return null;
        }
    }

    /** 
     * Initializes data.
     * 
     * Creates canvas and image instances.
     */
    function initdata(loggedUsersName, topUsers) {
        
        // Basic canvas settings
        totalImageLoaded = 0;
        data = {
            w: 1257, // Canvas w.
            h: 660, // Canvas h.
            cxf: 221, // Card x. (for first card)
            cy: 177, // Card y.
            cw: 239, // Card w.
            ch: 350, // Card h.
            cd: 287, // X-distance between cards.
            padding: 20 // Padding. 
        };
        
        // Creates canvas
        canvas = document.createElement("canvas");
        canvas.width = data.w;
        canvas.height = data.h;
        ctx = canvas.getContext("2d");

        // Creates user data
        data.loggeduser = loggedUsersName;
        data.users = topUsers;

        // Creates images
        data.background = new Image;
        data.images = [];

        for (i = 0; i < 3; i++) {
            let ix, iy, iw, ih;

            ix = data.cxf + (i * data.cd) + data.padding;
            iy = data.cy + data.padding;
            iw = data.cw - 2 * data.padding;
            ih = iw;

            data.images[i] = new Image;
            data.images[i].data = { x: ix, y: iy, w: iw, h: ih };
        }
    }

    /**
     * Draws texts on canvas.
     */
    function drawTexts() {

        // Title.
        let tx, ty, text;

        ctx.font = "80px Calibri";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        tx = data.w / 2;
        ty = data.cy / 2;
        text = data.loggeduser + "'s Top Friends";
        ctx.fillText(text, tx, ty, 630);

        // Names and Numbers.
        for (i = 0; i < 3; i++) {
            let ix, iy, iw, ih, ch;
            ix = data.images[i].data.x;
            iy = data.images[i].data.y;
            iw = data.images[i].data.w;
            ih = data.images[i].data.h;
            ch = data.ch;
            cy = data.cy;

            // Center of image.
            tx = ix + (iw / 2);
            // Center of the gap between card-bottom and image-bottom.
            ty = iy + ih + ((ch + cy - ih - iy) / 2);

            ctx.font = "50px Verdana";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillText(data.users[i].short_name, tx, ty - 2, iw);

            ctx.font = "38px Calibri";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillText(data.users[i].count_str, tx, ty + 2, iw);
        }
    }

    /**
     * Draws images on canvas.
     */
    async function drawImages() {
        await new Promise(resolve => {
            data.background.crossOrigin = "anonymous";
            data.background.src = "img/others/canvas-background.png";
            data.background.onload = async function () {

                // Draws background.
                ctx.drawImage(data.background, 0, 0);

                // Draws other images.
                for (i = 0; i < 3; i++) {
                    data.images[i].crossOrigin = "anonymous";
                    data.images[i].src = data.users[i].image_url;
                    data.images[i].onload = async function () {

                        roundRegion(this.data.x, this.data.y, this.data.w, this.data.h, 14);
                        ctx.save();
                        ctx.clip();
                        ctx.drawImage(this, this.data.x, this.data.y, this.data.w, this.data.h);
                        ctx.restore();

                        totalImageLoaded++;

                        if (totalImageLoaded == 3)
                            resolve();
                            
                    }
                    data.images[i].onerror = function () {
                        this.src = "img/others/placeholder-user-image.png";
                    }
                }

            };
        });
    }

    /** 
     * Creates round region on canvas. 
     */
    function roundRegion(x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    /**
     * Returns base64 string of canvas
     * and dereferences all variables.
     */
    function createBase64() {
        let base64 = canvas.toDataURL("image/png");
        dispose();
        return base64;
    }

    /**
     * Disposes objects.
     */
    function dispose() {
        ctx = null;
        canvas = null;
        data.background = null;
        data.images.forEach(image => {
            image = null;
        });
        data = null;
    }

    return {
        getCanvasUri: getCanvasUri
    }

})();