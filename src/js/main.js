"use strict";

let beerObjects;

fetchAndReturnObject("https://api.punkapi.com/v2/beers?per_page=80&page=").then((response) => {
  beerObjects = response;
  insertElements(response, 12, 1);
});

//lägg till felhantering!
//fetchar och retunerar json objekt
//funktionen gör oändliga request på 404. T.ex om man söker på något som inte finns
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
    addDateToObjects(completeArray);
    i++;
  }
  // console.log("length: " + completeArray.length);
  // console.log(completeArray);
  return completeArray;
}

function addDateToObjects(beerObjects) {
  for (let i = 0; i < beerObjects.length; i++) {
    let beerDateString = beerObjects[i].first_brewed;
    let dateObject = new Date();

    if (beerDateString.length === 7) {
      let yearString = beerDateString.slice(3, 9);
      let monthString = beerDateString.slice(0, 2);
      dateObject.setFullYear(+yearString, +monthString - 1, 1);
    }
    if (beerDateString.length === 4) {
      let yearString = beerDateString.slice(0, 5);
      dateObject.setFullYear(+yearString, 11, 31);
    }
    beerObjects[i].date = dateObject;
  }
}

//Lägg till parametrar för hur många items och från vilket item den ska börja
//Lägger till cards från Json
//lägger till buttons
function insertElements(array, amount, page) {
  let cardContainer = document.querySelector(".card-container");

  if (array.length === 0) {
    cardContainer.innerHTML = `
    <div class="error">
      <h2>We could not find any beers matching your request</h2>
      <p>Check if your spelling is correct. If you believe this is an error feel free to contact us.</p>
    </div>`;
    return;
  }

  amount = +amount;
  let i = amount * (page - 1);
  let loopLength = amount + i;
  let amountOfPages = Math.ceil(array.length / amount);

  cardContainer.innerHTML = "";

  for (i; i < loopLength; i++) {
    if (array[i] === undefined) {
      continue;
    }
    let beer = array[i];
    let beerImageSource = beer.image_url;
    let beerName = beer.name;
    let tagline = beer.tagline;
    let beerDate = beer.first_brewed;
    let alcoholContent = beer.abv + "%";
    let ibu = beer.ibu ? beer.ibu : "Unknown";
    let beerDescription = beer.description;
    let maltArray = beer.ingredients.malt;
    let maltString = "";
    let beerId = beer.id;

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
              <button id="favorite-${beerId}" type="button" class="btn button-favorites">Add to favorites</button>
            </div>
        </div>
      </div>
    `;
  }

  let buttonString = `<div class="page-buttons">
  <button id="forward-${page - 1} title="go-back-page-button" type="button" class="pageBack button-arrow"><i class="bi bi-caret-left-fill"></i></button>`;
  for (let i = 1; i <= amountOfPages; i++) {
    if (i === page) {
      buttonString += `<button id="page-${i}" type="button" class="page-button active">${i}</button>`;
    } else {
      buttonString += `<button id="page-${i}" type="button" class="page-button">${i}</button>`;
    }
  }
  buttonString += `<button id="forward-${page + 1}" title="go-forward-page-button" type="button" class="pageForward button-arrow"><i class="bi bi-caret-right-fill"></i></button>
  </div>`;
  cardContainer.innerHTML += buttonString;

  let pageButtonContainer = document.querySelector(".page-buttons");

  //kanske bättre att använde pointerdown
  pageButtonContainer.addEventListener("click", (event) => {
    let target = event.target.closest("button");

    if (!target || !pageButtonContainer.contains(target)) {
      return;
    }

    changePage(target);
  });
}

const sortForm = document.querySelector(".sort-settings");
const amountOfItems = document.querySelector("#amount");
const maltFilter = document.querySelector("#filter-by-malt");
const sortOptions = document.querySelector("#sort-by");

amountOfItems.addEventListener("change", () => {
  insertElements(beerObjects, amountOfItems.value, 1);
});

maltFilter.addEventListener("change", () => {
  const text = "Sort";
  const options = Array.from(sortOptions.options);
  const optionToSelect = options.find(item => item.text === text);
  optionToSelect.selected = true;

  if (maltFilter.value === "All" || maltFilter.value === undefined) {
    fetchAndReturnObject("https://api.punkapi.com/v2/beers?per_page=80&page=").then((response) => {
      beerObjects = response;
      insertElements(response, amountOfItems.value, 1);
    });
  } else {
    fetchAndReturnObject(`https://api.punkapi.com/v2/beers?malt=${maltFilter.value}&per_page=80&page=`).then(
      (response) => {
        beerObjects = response;
        insertElements(beerObjects, amountOfItems.value, 1);
      }
    );
  }
});

sortForm.addEventListener("submit", (e) => {
  let searchInput = document.querySelector("#search-by-name");

  if (searchInput.value != undefined && searchInput.value != null && searchInput.value != "") {
    e.preventDefault();

    let searchInputFormatted = searchInput.value.replace(/\s/g, "_");
    fetchAndReturnObject(`https://api.punkapi.com/v2/beers?beer_name=${searchInputFormatted}&per_page=80&page=`).then(
      (response) => {
        beerObjects = response;
        insertElements(beerObjects, amountOfItems.value, 1);
      }
    );
  }
});

sortOptions.addEventListener("change", () => {
  //funktion med en switch case. Beroende på switch case sortera
  //beerObjects arrayen på olika sätt.
  //behöver lista ut hur man sorterar från object properties
  switch (sortOptions.value) {
    case "A-Z":
      arraySortAlphabet();
      insertElements(beerObjects, amountOfItems.value, 1);
      break;
    case "Z-A":
      arraySortReverseAlphabet();
      insertElements(beerObjects, amountOfItems.value, 1);
      break;
    case "Newest":
      arraySortByNew();
      insertElements(beerObjects, amountOfItems.value, 1);
      break;
    case "Oldest":
      arraySortByOldest();
      insertElements(beerObjects, amountOfItems.value, 1);
      break;
  }
});

//Sorterar array efter objekt name property bokstavsordning
function arraySortAlphabet() {
  beerObjects.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
}

//Sorterar array efter objekt name property baklänges bokstavsordning
function arraySortReverseAlphabet() {
  beerObjects.sort((a, b) => (a.name < b.name ? 1 : b.name > a.name ? -1 : 0));
}

function arraySortByNew() {
  beerObjects.sort((a, b) => (a.date < b.date ? 1 : b.date > a.date ? -1 : 0));
}

function arraySortByOldest() {
  beerObjects.sort((a, b) => (a.date > b.date ? 1 : b.date > a.date ? -1 : 0));
}

function changePage(button) {
  let pageToSwitch = button.getAttribute("id");
  pageToSwitch = pageToSwitch.replace(/\D/g, "");

  //bläddrar inte alltid upp. behöver fixas
  //prova att sätta en timeout och se om det löser problemet
  
  // setTimeout(function() {
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // }, 2000);

  insertElements(beerObjects, amountOfItems.value, +pageToSwitch);
  window.scrollTo({ top: 0, behavior: "smooth" });
}
