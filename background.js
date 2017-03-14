function createIcon(price, stock, up){
  var canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  var context = canvas.getContext('2d');

  // start with a large font size
  var fontsize=8;
  var fontface = 'Times New Roman';
  var split = stock.split(':');
  var text = split.length > 1 ? split[1] : split[0];

  context.font = "8px Times New Roman"
  context.fillStyle = "black";
  context.fillText(text, 0, 8);

  fontsize = 20;
  text = price.split('.')[0];
  do{
    fontsize--;
    context.font=fontsize+"px "+fontface;
  }while(context.measureText(text).width>canvas.width)

  context.fillStyle = up ? "green" : "red";
  context.fillText(text, 0, 20);

  fontsize = 20;
  text = price.split('.')[1];
  do{
    fontsize--;
    context.font=fontsize+"px "+fontface;
  }while(context.measureText(text).width>canvas.width)

  context.fillStyle = up ? "green" : "red";
  context.fillText(text, 0, 32);

  var imageData = context.getImageData(0, 0, 32, 32);
  chrome.browserAction.setIcon({
    imageData: imageData
  });
}

function onTick(){
  chrome.storage.local.get(['clock-index', 'stocks'], function(res){
    var index = res['clock-index'];
    var stocks = res['stocks'];

    if(!stocks || stocks == []) return;
    if(!index) index = 0;

    var stock = stocks[index];

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        try{
          var resp = JSON.parse(xhr.responseText.substring(3))[0];
          console.log(stock + ": " + resp["l"]);
          createIcon(resp["l"], stock, resp["c"].indexOf('-') == -1 ? false : true);
        }catch(e){
          console.error(e);
        }
      }
    };
    xhr.open("GET", "http://finance.google.com/finance/info?client=ig&q=" + stock, true);
    xhr.send();

    chrome.storage.local.set({'clock-index': stocks[index + 1] ? index + 1 : 0}, function(){});
  });
}

setInterval(onTick, 3000);
