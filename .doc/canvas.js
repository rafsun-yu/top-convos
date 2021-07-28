var back_image = new Image;
var person1_image = new Image; 
var person2_image = new Image;
var person3_image = new Image;
var glass_effect = new Image;
back_image.crossOrigin = "Anonymous";
person1_image.crossOrigin = "Anonymous";
person2_image.crossOrigin = "Anonymous";
person3_image.crossOrigin = "Anonymous";
var person1_name = "";
var person2_name = "";
var person3_name = "";
var person1_number = "";
var person2_number = "";
var person3_number = "";
var person1_imgsrc = "";
var person2_imgsrc = "";
var person3_imgsrc = "";
var user_name = "";
var width;

function roundedImage(x,y,width,height,radius, ctx){
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

function LoadAndDrawImages() {
	try {
			// Drawing images 
			var ctx = canvas.getContext("2d");
			back_image.src = "images/background1.png";
			back_image.onload = function() {
				glass_effect.src = "images/glass.png";
				glass_effect.onload = function() {
					ctx.drawImage(back_image,0,0); 
					DrawTexts(ctx);

					person1_image.src = person1_imgsrc;
					person1_image.onload = function() {
						ctx.save();
						roundedImage(116+114+6,194+0,208,208,14, ctx);
						ctx.clip();
						ctx.drawImage(person1_image,116+114+6,194+0,208,208);
						ctx.drawImage(glass_effect,116+114+6,194+0,208,208);
						
						ctx.restore();

						person2_image.src = person2_imgsrc;
						person2_image.onload = function() {
							ctx.save();
							roundedImage(116+400+6,194+0,208,208,14, ctx);
							ctx.clip();
							ctx.drawImage(person2_image,116+400+6,194+0,208,208);
							ctx.drawImage(glass_effect,116+400+6,194+0,208,208);
							ctx.restore();

							person3_image.src = person3_imgsrc;
							person3_image.onload = function() {
								ctx.save();
								roundedImage(116+690+6,194+0,208,208,14, ctx);
								ctx.clip();
								ctx.drawImage(person3_image,116+690+6,194+0,208,208);
								ctx.drawImage(glass_effect,116+690+6,194+0,208,208);
								ctx.restore();
								
								UploadCloudinary();
							}
						}
					}
				}
			}
		}
	catch (e) {
		ThrowError("Canvas Error",e.message,"Go back",3);
	}
}

function DrawTexts(ctx) {
	//Drawing user name 
	ctx.font = "80px Calibri";
	ctx.fillStyle = "white";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	text = user_name+"'s Top Friends";
	h = 30+50;
	x = 116+200+312;
	ctx.fillText(text,x,h,624);

	// Drawing names
	ctx.font = "50px Verdana";
	ctx.fillStyle = "white";
	ctx.textAlign = "center";
	ctx.textBaseline = "top";
	
	text = person1_name;
	h = 400+18;
	x = 116+120;
	ctx.fillText(text,x+105, h, 210);

	text = person2_name;
	h = 400+18;
	x = 116+405;
	ctx.fillText(text,x+105, h, 210); 

	text = person3_name;
	h = 400+18;
	x = 116+695;
	ctx.fillText(text,x+105, h, 210);
	
	// Drawing number of messages
	ctx.font = "38px Calibri";
	ctx.fillStyle = "white";
	ctx.textAlign = "center";
	ctx.textBaseline = "top";
	
	text = person1_number;
	h = 400+18+50+8-3;
	x = 116+120;
	ctx.fillText(text,x+105, h, 210);

	text = person2_number;
	x = 116+405;
	ctx.fillText(text,x+105, h, 210);

	text = person3_number;
	x = 116+695;
	ctx.fillText(text,x+105, h, 210);
}