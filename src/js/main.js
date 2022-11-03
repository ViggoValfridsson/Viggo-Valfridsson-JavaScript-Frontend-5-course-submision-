"use strict";

let beerObjects;

fetchAndReturnObject("https://api.punkapi.com/v2/beers?per_page=80&page=").then((response) => {
  beerObjects = response;
  insertElements(response, 12, 1);
});

//lägg till felhantering!
//fetchar och retunerar json objekt
async function fetchAndReturnObject(url) {
  let completeArray = [];
  let moreObjectsStillExist = true;
  let i = 1;
  while (moreObjectsStillExist) {
    let response = await fetch(url + i);
    let json = await response.json();
    if (json.length == 0) {
      moreObjectsStillExist = false;
    }
    completeArray = completeArray.concat(json);
    i++;
  }
  console.log(completeArray);
  return completeArray;
}

//Lägg till parametrar för hur många items och från vilket item den ska börja
//Lägger till cards från Json
//lägger till buttons
function insertElements(array, amount, page) {
  let cardContainer = document.querySelector(".card-container");
  if (isNaN(amount)) {
    amount = array.length;
  } else {
    amount = +amount;
  }
  let i = amount * (page - 1);
  let loopLength = amount + i;
  let amountOfPages = Math.ceil(array.length / amount);

  cardContainer.innerHTML = "";

  for (i; i < loopLength; i++) {
    let beerImageSource = array[i].image_url;
    let beerName = array[i].name;
    let tagline = array[i].tagline;
    let beerDate = array[i].first_brewed;
    let alcoholContent = array[i].abv + "%";
    let ibu = array[i].ibu ? array[i].ibu : "Unknown";
    let beerDescription = array[i].description;
    let maltArray = array[i].ingredients.malt;
    let maltString = "";

    for (let i = 0; i < maltArray.length; i++) {
      let name = maltArray[i].name;
      if (i != maltArray.length - 1) {
        name += ", ";
      }
      maltString += name;
    }

    cardContainer.innerHTML += `
      <div class="card">
        <div class="img-wrapper">
          <img src="${beerImageSource}" class="card-img-top" alt="A picture of ${beerName}" />
        </div>
        <div class="card-body">
          <h2 class="card-title">${beerName}</h2>
          <p class="tagline">${tagline}</p>
          <ul class="Info">
            <li>${beerDate}</li>
            <li>ABV: ${alcoholContent}</li>
            <li>IBU: ${ibu}</li>
            <li>Malt: ${maltString}</li>
          </ul>
          <p class="description">${beerDescription}</p>
            <div class="button-wrapper">
              <button type="button" class="btn">Add to favorites</button>
            </div>
        </div>
      </div>
    `;
  }
  let buttonString = `<div class="page-buttons">
  <button title="go-back-page-button" type="button" class="pageBack button-arrow"><i class="bi bi-caret-left-fill"></i></button>`;
  for (let i = 1; i <= amountOfPages; i++) {
    if (i === page) {
      buttonString += `<button id="page-${i}" type="button" class="page-button active">${i}</button>`;
    } else {
      buttonString += `<button id="page-${i}" type="button" class="page-button">${i}</button>`;
    }
  }
  buttonString += `   <button title="go-forward-page-button" type="button" class="pageForward button-arrow"><i class="bi bi-caret-right-fill"></i></button>
  </div>`;
  cardContainer.innerHTML += buttonString;
}

let amountOfItems = document.querySelector("#amount");
let maltFilter = document.querySelector("#filter-by-malt").value;

//Gör så att den här  inte anropar fetchen utan använder det tidigare resultatet
amountOfItems.addEventListener("change", () => {
  insertElements(beerObjects, amountOfItems.value, 1);
});
