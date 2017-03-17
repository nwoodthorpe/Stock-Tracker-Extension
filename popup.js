function onLoad(){
  chrome.storage.local.get('stocks', function(res){
    var stocks = res['stocks'];
    if(!stocks){
      stocks = []
    };

    for(var i = 0; i < stocks.length; i++){
      addRowFromStock(stocks[i]);
    }
  });
}

function addRowFromStock(stock){
  var list = document.getElementById('stock-list');

  var row = document.createElement("div");
  row.classList.add('row');

  var remove = document.createElement("input");
  remove.setAttribute("type", "button");
  remove.addEventListener("click", onRemoveClicked);
  remove.setAttribute("value", "x");
  remove.setAttribute("x-stock-value", stock);
  remove.classList.add("remove-button");

  var name = document.createElement("div");
  name.innerHTML = stock;

  row.appendChild(remove);
  row.appendChild(name);

  list.appendChild(row);
}

function onRemoveClicked(event){
  var element = event.target;
  var stock = element.getAttribute("x-stock-value");

  chrome.storage.local.get("stocks", function(res){
    var stocks = res['stocks'];
    var newstocks = [];

    document.getElementById("stock-list").innerHTML = "";

    for(var i = 0; i < stocks.length; i++){
      if(stocks[i] != stock){
        newstocks.push(stocks[i]);
        addRowFromStock(stocks[i]);
      }
    }

    chrome.storage.local.set({"stocks": newstocks}, function(){});
  })
}

function onStockButtonClicked(){
  var error = document.getElementById('error');
  var textbox = document.getElementById('addStockText');
  var stock = textbox.value;

  error.classList.add('disabled');

  if(stock == ""){
    error.classList.remove('disabled');
  }else{
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        try{
          if(stock != "eth"){
            JSON.parse(xhr.responseText.substring(3));
          }
          // If it parsed correctly, assume the response was good and this is a valid stock

          chrome.storage.local.get('stocks', function(res){
            var stocks = res['stocks'];
            if(!stocks){
              stocks = [];
            }

            stocks.push(stock);
            chrome.storage.local.set({'stocks': stocks}, function(){});
            console.log("STOCKS NOW SET TO " + stocks);

            addRowFromStock(stock);
            textbox.value = "";
          });
        }catch(e){
          error.classList.remove('disabled');
        }
      }
    };
    xhr.open("GET", "http://finance.google.com/finance/info?client=ig&q=" + stock, true);
    xhr.send();
  }
}

document.getElementById('addStockButton').addEventListener('click', onStockButtonClicked);
document.addEventListener("DOMContentLoaded", onLoad);
