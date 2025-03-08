//Grayscale Image
var image;

function upload(){
  var fileinput = document.getElementById("finput");
  var filename = fileinput.value;
  alert("You chose" + filename);
  
  image = new SimpleImage(fileinput);

  var canvas = document.getElementById("can");
  image.drawTo(canvas);
}

function makeGray(){
  for (var pixel of image.values()){
    var avg = (pixel.getRed()+pixel.getGreen()+pixel.getBlue())/3;
    pixel.setRed(avg);
    pixel.setGreen(avg);
    pixel.setBlue(avg);
  }
  var canvas = document.getElementById("graycan");
  image.drawTo(canvas)
}

//Merge Image
var fgImage = null;
var bgImage = null;

function loadForegroundImage(){
  var imgFile = document.getElementById("fgfile");
  fgImage = new SimpleImage(imgFile);
  var canvas = document.getElementById("fgcan");
  fgImage.drawTo(canvas);
}

function loadBackgroundImage(){
  var imgFile = document.getElementById("bgfile");
  bgImage = new SimpleImage(imgFile);
  var canvas = document.getElementById("bgcan");
  bgImage.drawTo(canvas);
}

function greenScreen(){
  if (fgImage == null || !fgImage.complete()){
    alert("foreground not loaded");
    return;
  }
  if (bgImage == null || !bgImage.complete()){
    alert("background not loaded");
  }
  clearCanvas();
  var fgCanvas = document.getElementById("fgcan");
  var finalImage = merge();
  finalImage.drawTo(fgCanvas);
}

function clearCanvas() {
    var fgCanvas = document.getElementById("fgcan");
    var bgCanvas = document.getElementById("bgcan");

    var fgContext = fgCanvas.getContext("2d");  
    var bgContext = bgCanvas.getContext("2d");  

    fgContext.clearRect(0, 0, fgCanvas.width, fgCanvas.height); 
  
    bgContext.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    }

function merge(){
  //make final image width & size the same as the smallest image of the two
  var width = Math.min(fgImage.getWidth(), bgImage.getWidth());
  var height = Math.min(fgImage.getHeight(), bgImage.getHeight());
  var output = new SimpleImage(width, height);
//  var output = new SimpleImage(fgImage.getWidth(), fgImage.getHeight());

//  var greenThreshold = 240;
  for (var pixel of fgImage.values()){
    var x = pixel.getX();
    var y = pixel.getY();

    if(x < width && y < height){ //ensure within boundary
//    if (pixel.getGreen() > greenThreshold){
    if (pixel.getGreen() > pixel.getRed() + pixel.getBlue()){
        //pixel is green, use background
        var bgPixel = bgImage.getPixel(x, y);
        output.setPixel(x, y, bgPixel);
       }
      else{
         output.setPixel(x,y,pixel);
       }
      }
  }
     return output;
}


function mergeImages() {
       var finalImage = greenScreen();
       if (finalImage) {
                var fgCanvas = document.getElementById("fgcan");
                finalImage.drawTo(fgCanvas);
       }
}
