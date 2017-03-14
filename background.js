// Price sometimes gets formatted weirdly by the API, so we tidy it here
function cleanPrice(price){
  var dollar = price.split('.')[0];
  var cent = price.split('.')[1];

  dollar = dollar.split(',').join('');
  cent = cent.substring(0, 2);

  return dollar + "." + cent;
}

function createIcon(price, stock, up){
  console.log(price);
  price = cleanPrice(price.toString());

  var canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  var context = canvas.getContext('2d');

  // start with a large font size
  var fontsize=16;
  var fontface = 'Times New Roman';
  var split = stock.split(':');
  var text = split.length > 1 ? split[1] : split[0];

  // lower the font size until the text fits the canvas
  do{
    fontsize--;
    context.font=fontsize+"px "+fontface;
  }while(context.measureText(text).width>canvas.width)

  context.fillStyle = "black";
  context.fillText(text, 0, 12);

  fontsize = 16;
  text = price;
  do{
    fontsize--;
    context.font=fontsize+"px "+fontface;
  }while(context.measureText(text).width>canvas.width)

  context.fillStyle = up ? "green" : "red";
  context.fillText(text, 0, 28);

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
          if(stock != "eth"){
            var resp = JSON.parse(xhr.responseText.substring(3))[0];
            createIcon(resp["l"], stock, resp["c"].indexOf('-') == -1 ? false : true);
          }else{
            var resp = JSON.parse(xhr.responseText);
            createIcon(resp["price"]["usd"], "Eth", resp["change"].indexOf('-') == -1 ? false : true)
          }
        }catch(e){
          console.error(e);
        }
      }
    };
    if(stock != "eth"){
      xhr.open("GET", "http://finance.google.com/finance/info?client=ig&q=" + stock, true);
    }else{
      xhr.open("GET", "https://coinmarketcap-nexuist.rhcloud.com/api/eth", true);
    }
    xhr.send();

    chrome.storage.local.set({'clock-index': stocks[index + 1] ? index + 1 : 0}, function(){});
  });
}

setInterval(onTick, 3000);
