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

function clearGCanvas() {
    var GrayCanvas = document.getElementById("graycan");
    var Canvas = document.getElementById("can");

    var GrayContext = GrayCanvas.getContext("2d"); 
    var Context = Canvas.getContext("2d");  
    

    GrayContext.clearRect(0, 0, GrayCanvas.width, GrayCanvas.height); 

    Context.clearRect(0, 0, Canvas.width, Canvas.height);
    
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

//hide image

var oImage = null;
var hImage = null;

function loadOriginalImage(){
  var oFile = document.getElementById("ofile");
  oImage = new SimpleImage(oFile);
  var ocanvas = document.getElementById("ocan");
  oImage.drawTo(ocanvas);
}

function loadHideImage(){
  var hFile = document.getElementById("hfile");
  hImage = new SimpleImage(hFile);
  var hcanvas = document.getElementById("hcan");
  hImage.drawTo(hcanvas);
}

function steganography(){
  clearHCanvas();
  var Canvas = document.getElementById("ocan");
  var finalImage = hide();
  finalImage.drawTo(Canvas);
}

function clearHCanvas() {
    var oCanvas = document.getElementById("ocan");
    var hCanvas = document.getElementById("hcan");

    var oContext = oCanvas.getContext("2d");  
    var hContext = hCanvas.getContext("2d");  

    oContext.clearRect(0, 0, oCanvas.width, oCanvas.height); 
  
    hContext.clearRect(0, 0, hCanvas.width, hCanvas.height);
    }

function hide(){
  
  // Crop both images to the same size before hiding
  cropToSameSize(oImage, hImage);
  
  oImage = chop2hide(oImage);
  hImage = shift(hImage);
  
  var stego = combine(oImage, hImage);
  return stego;
  
}

function clearRbits(pixval){
  var x = Math.floor(pixval/16)*16;
  return x;
}

function chop2hide(image){
  for(var px of image.values()){
    px.setRed(clearRbits(px.getRed()));
    px.setGreen(clearRbits(px.getGreen()));
    px.setBlue(clearRbits(px.getBlue()));
  }
  return image;
}

function clearLbits(pixval){
  var x = Math.floor(pixval/16);
  return x;
}

function shift(image){
   for(var px of image.values()){
    px.setRed(clearLbits(px.getRed()));
    px.setGreen(clearLbits(px.getGreen()));
    px.setBlue(clearLbits(px.getBlue()));
  }
  return image;
}

function combine(show, hide){
  var answer = new SimpleImage(show.getWidth(), show.getHeight());
  
  for(var px of answer.values()){
    var x = px.getX();
    var y = px.getY();
    
    var showPixel = show.getPixel(x,y);
    var hidePixel = hide.getPixel(x,y);
    px.setRed(showPixel.getRed() + hidePixel.getRed());
    px.setGreen(showPixel.getGreen() + hidePixel.getGreen());
    px.setBlue(showPixel.getBlue() + hidePixel.getBlue());
  }
  return answer;
}

// Crop both images to the same size
function cropToSameSize(image1, image2) {
  var width1 = image1.getWidth();
  var height1 = image1.getHeight();
  var width2 = image2.getWidth();
  var height2 = image2.getHeight();
  
  // Calculate new width and height for cropping
  var newWidth = Math.min(width1, width2);
  var newHeight = Math.min(height1, height2);

  // Crop the first image
  image1 = cropImage(image1, newWidth, newHeight);
  
  // Crop the second image
  image2 = cropImage(image2, newWidth, newHeight);
}

function cropImage(image, newWidth, newHeight) {
  var croppedImage = new SimpleImage(newWidth, newHeight);
  
  for (var y = 0; y < newHeight; y++) {
    for (var x = 0; x < newWidth; x++) {
      var pixel = image.getPixel(x, y);
      var croppedPixel = croppedImage.getPixel(x, y);
      croppedPixel.setRed(pixel.getRed());
      croppedPixel.setGreen(pixel.getGreen());
      croppedPixel.setBlue(pixel.getBlue());
    }
  }
  
  return croppedImage;
}

//retrieve image

var RImage = null;

function loadRetrieveImage(){
  var RFile = document.getElementById("fput");
  RImage = new SimpleImage(RFile);
  var Rcanvas = document.getElementById("recan");
  RImage.drawTo(Rcanvas);
}

function clearRCanvas() {
    var Canvas = document.getElementById("recan");

    var Context = Canvas.getContext("2d");  
    
    Context.clearRect(0, 0, Canvas.width, Canvas.height);
    
 }

function findRbits(pixval){
  var x = Math.floor((pixval%16)*16);
  return x;
}


function retrieve(){
     if (RImage == null || !RImage.complete()){
       alert("image not loaded!");
       return;
     }
     var hiddenImage = new SimpleImage(RImage.getWidth(), RImage.getHeight());
  
     for (var x = 0; x < RImage.getWidth(); x++) {
        for (var y = 0; y < RImage.getHeight(); y++) {
            var originalPixel = RImage.getPixel(x, y);
            var hiddenPixel = hiddenImage.getPixel(x, y);

            hiddenPixel.setRed(findRbits(originalPixel.getRed()));
            hiddenPixel.setGreen(findRbits(originalPixel.getGreen()));
            hiddenPixel.setBlue(findRbits(originalPixel.getBlue()));
        }
    }

    clearRCanvas();
    var Canvas = document.getElementById("recan");
    hiddenImage.drawTo(Canvas);
}
