// Price sometimes gets formatted weirdly by the API, so we tidy it here
function cleanPrice(price){
  var dollar = price.split('.')[0];
  var cent = price.split('.')[1];

  dollar = dollar.split(',').join('');
  cent = cent.substring(0, 2);

  return dollar + "." + cent;
}

function createIcon(price, stock, up, scroll = 0){
  price = cleanPrice(price.toString());

  var canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  var context = canvas.getContext('2d');

  // start with a large font size
  context.font = "28px Times New Roman";
  var split = stock.split(':');
  var name = split.length > 1 ? split[1] : split[0];

  context.fillStyle = "black";
  context.fillText(name, 30 - scroll, 26);

  context.fillStyle = up ? "green" : "red";
  context.fillText(price, 40 + context.measureText(name).width - scroll, 28);

  chrome.storage.local.set({'scroll': scroll + 1}, function(){});

  var imageData = context.getImageData(0, 0, 32, 32);
  chrome.browserAction.setIcon({
    imageData: imageData
  });

  if (scroll > context.measureText(name).width + context.measureText(price).width + 45){
    onTick();
  }else{
    setTimeout(function(){ createIcon(price, stock, up, scroll + 0.5)}, 10);
  }
}

function onTick(){
  chrome.storage.local.get(['clock-index', 'stocks', 'text', 'price'], function(res){
    var index = res['clock-index'];
    var stocks = res['stocks'];
    var text = res['text'];
    var price = res['price']

    if(!stocks || stocks == []) return;
    if(!index) index = 0;

    var stock = stocks[index];

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        try{
          if(stock != "eth"){
            var resp = JSON.parse(xhr.responseText.substring(3))[0];
            console.log(resp["c"])
            createIcon(resp["l"], stock, resp["c"].indexOf('-') == -1);
          }else{

            var resp = JSON.parse(xhr.responseText);
            console.log(resp["change"]);
            createIcon(resp["price"]["usd"], "Eth", resp["change"].indexOf('-') == -1)
          }

          chrome.storage.local.set(
            {
              'clock-index': stocks[index + 1] ? index + 1 : 0,
              'price': resp['l'],
              'text': stock
            }, function(){});
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
  });
}

onTick();
