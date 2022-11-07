"use strict";
import { setCookie, getCookie, deleteCookie } from "./cookies";

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

  let backPageNumber = page - 1 > 0 ? page - 1 : 1;
  let highestAllowedPage;
  let buttonString = `<div class="page-buttons">
  <button id="forward-${backPageNumber} title="go-back-page-button" type="button" class="pageBack button-arrow"><i class="bi bi-caret-left-fill"></i></button>`;
  for (let i = 1; i <= amountOfPages; i++) {
    if (i === page) {
      buttonString += `<button id="page-${i}" type="button" class="page-button active">${i}</button>`;
      highestAllowedPage = i;
    } else {
      buttonString += `<button id="page-${i}" type="button" class="page-button">${i}</button>`;
    }
  }
  let forwardPageNumber = page + 1 < highestAllowedPage ? page + 1 : highestAllowedPage;
  buttonString += `<button id="forward-${forwardPageNumber}" title="go-forward-page-button" type="button" class="pageForward button-arrow"><i class="bi bi-caret-right-fill"></i></button>
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

let cardContainer = document.querySelector(".card-container");

//deleteCookie("favoriteList");

//creates cookie "favoriteList". Value is a string with id's separated by a comma
//need to check if beer already exists and doesnt add it again.
//needs to store cookie in a way that allows for indivudual deletions
cardContainer.addEventListener("click", (event) => {
  let target = event.target.closest(".button-favorites");

  if (!target || !cardContainer.contains(target)) {
    return;
  }

  buttonFlash(target);
  // ta ut id från button #id attribut.
  let targetId = target.getAttribute("id");
  targetId = targetId.replace(/\D/g, "");

  //ta in cookies nuvarnde värde
  let cookie = getCookie("favoriteList");

  if (cookie) {
    cookie += "," + targetId;
  } else {
    cookie = targetId;
  }

  setCookie("favoriteList", cookie, { secure: true, "max-age": 31536000, samesite: "lax" });
});

function buttonFlash(target) {
  target.classList.add("active-button");
  target.innerHTML = "&#10003 Added to favorites";

  setTimeout(() => {
    target.classList.remove("active-button");
    target.innerHTML = "Add to favorites";
  }, 700);
}

const showListButton = document.querySelector("#favorite-list");
const clearCookiesButton = document.querySelector("#clear-cookies-button");

showListButton.addEventListener("click", () => {
  showModalSpinner();
  fetchAndReturnObject("https://api.punkapi.com/v2/beers?per_page=80&page=").then((response) => {
    let allBeerObjects = response;
    let favoriteBeers = findFavoriteBeers(allBeerObjects);
    insertModalContent(favoriteBeers);
  });
});

function showModalSpinner() {
  modalBody.innerHTML = `  
  <div class="spinner-container">
    <div class="spinner-border spinner-border-sm text-white" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>`;
}

clearCookiesButton.addEventListener("click", () => {
  deleteCookie("favoriteList");
  insertModalContent();
});

function findFavoriteBeers(allBeerObjects) {
  let currentCookies = getCookie("favoriteList");
  let favoriteObjects = [];

  if (!currentCookies) {
    return false;
  }

  currentCookies = currentCookies.split(",");

  for (let i = 0; i < currentCookies.length; i++) {
    favoriteObjects.push(allBeerObjects.find((item) => item.id == currentCookies[i]));
  }
  return favoriteObjects;
}

function insertModalContent(favoriteObjects) {
  const modalBody = document.querySelector(".modal-body");

  if (!favoriteObjects) {
    modalBody.innerHTML = `
    <h2 class="no-beer">You currently don't have any beers in your list.</h2>
    <h3 class="lead">You can add beers by clicking the add to favorites button.</h3>
  `;
    return;
  }

  modalBody.innerHTML = "";

  for (let i = 0; i < favoriteObjects.length; i++) {
    let beer = favoriteObjects[i];
    let ibu = beer.ibu ? beer.ibu : "Unknown";
    let maltArray = beer.ingredients.malt;
    let maltString = "";

    for (let i = 0; i < maltArray.length; i++) {
      let name = maltArray[i].name;
      if (i != maltArray.length - 1) {
        name += ", ";
      }
      maltString += name;
    }

    modalBody.innerHTML += `
    <div class="list-beer">
      <div class="img-wrapper">
        <img src="${beer.image_url}" class="card-img-top" alt="A picture of ${beer.name}" />
      </div>
      <div class="beer-body">
        <div class="header-div">
          <h2 class="beer-title">${beer.name}</h2>
          <button id="delete-beer-${beer.id}" type="button" class="delete-beer close-button">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <p class="tagline">${beer.tagline}</p>
        <ul class="Info">
          <li>${beer.first_brewed}</li>
          <li>ABV: ${beer.abv + "%"}</li>
          <li>IBU: ${ibu}</li>
          <li>${maltString}</li>
        </ul>
        <p class="description">${beer.description}</p>
      </div>
    </div>`;
  }
}

let modalBody = document.querySelector(".modal-body");

modalBody.addEventListener("click", (event) => {
  let target = event.target.closest(".delete-beer");

  if (!target) {
    return;
  }

  deleteSpecificCookie(target);
});

function deleteSpecificCookie(target) {
  let deleteId = target.getAttribute("id");
  deleteId = deleteId.replace(/\D/g, "");

  let currentCookies = getCookie("favoriteList");
  currentCookies = currentCookies.split(",");
  let newCookie = [];

  for (let i = 0; i < currentCookies.length; i++) {
    if (currentCookies[i] != deleteId) {
      newCookie.push(currentCookies[i]);
    }
  }
  newCookie = newCookie.toString();
  setCookie("favoriteList", newCookie, { secure: true, "max-age": 31536000, samesite: "lax" });
  fetchAndReturnObject("https://api.punkapi.com/v2/beers?per_page=80&page=").then((response) => {
    let allBeerObjects = response;
    let favoriteBeers = findFavoriteBeers(allBeerObjects);
    insertModalContent(favoriteBeers);
  });
}

const sendDataModal = document.querySelector("#submit-modal");

sendDataModal.addEventListener("click", (event) => {
  const target = event.target.closest(".fetch-button");
  let postIcon = `<i class="bi bi-send"></i>`;
  let getIcon = `<i class="bi bi-file-arrow-down"></i>`;
  let putIcon = `<i class="bi bi-arrow-clockwise"></i>`;
  let deleteIcon = `<i class="bi bi-trash3"></i>`;

  if (!target) {
    return;
  }

  let targetId = target.getAttribute("id");

  switch (targetId) {
    case "fetch-post-button":
      postFavoriteList(target, postIcon);
      break;
    case "fetch-get-button":
      console.log("get");
      break;
    case "fetch-put-button":
      console.log("put");
      break;
    case "fetch-delete-button":
      console.log("delete");
      break;
  }
});

async function postFavoriteList(target, icon) {
  // if (target.innerHTML != icon) {
  //   return;
  // }
  insertButtonSpinner(target);
  try {
    const response = await fetchAndReturnObject("https://api.punkapi.com/v2/beers?per_page=80&page=");
    let favoriteBeers = findFavoriteBeers(response);

    await fetch("https://jsosnplaceholder.typicode.com/posts", {
      method: "POST",
      body: JSON.stringify(favoriteBeers),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    target.innerHTML = "&#10003";
    
    showFetchConfirmation("Succesfully sent list", target.getAttribute("id"), icon);
  } catch (err) {
    target.innerHTML = `<i class="bi bi-exclamation-triangle"></i>`;
    target.classList.add("failed");
    showFetchFailure(err, target.getAttribute("id"), icon);
  }
}

function insertButtonSpinner(target) {
  target.innerHTML = `  
  <div class="spinner-container">
    <div class="spinner-border spinner-border-sm text-white" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>`;
}

function showFetchConfirmation(message, targetId, icon) {
  sendDataModal.innerHTML += `
  <div id="confirmation-div" class="fetch-alert">
    <h4>${message}</h4>
  </div>
  `;

  setTimeout(() => {
    document.querySelector(".fetch-alert").remove();
    document.querySelector(`#${targetId}`).innerHTML = icon;
  }, 1500);
}

function showFetchFailure(err, targetId, icon) {
  sendDataModal.innerHTML += `
  <div id="fetch-fail-div" class="fetch-alert">
    <h4>${err}</h4>
    <p class="lead">Please try again</p>
  </div>
  `;
  setTimeout(() => {
    document.querySelector(".fetch-alert").remove();
    let target = document.querySelector(`#${targetId}`);
    target.classList.remove("failed");
    target.innerHTML = icon;
  }, 1500);
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
  const optionToSelect = options.find((item) => item.text === text);
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
  e.preventDefault();

  if (searchInput.value != undefined && searchInput.value != null && searchInput.value != "") {
    let searchInputFormatted = searchInput.value.replace(/\s/g, "_");
    fetchAndReturnObject(`https://api.punkapi.com/v2/beers?beer_name=${searchInputFormatted}&per_page=80&page=`).then(
      (response) => {
        beerObjects = response;
        insertElements(beerObjects, amountOfItems.value, 1);
      }
    );
  } else {
    window.location.reload();
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

  insertElements(beerObjects, amountOfItems.value, +pageToSwitch);
  document.querySelector("#top").scrollIntoView();
}
