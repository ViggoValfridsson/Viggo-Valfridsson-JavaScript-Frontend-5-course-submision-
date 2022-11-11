"use strict";

import { setCookie, getCookie, deleteCookie } from "./cookies";

let beerObjects;
let userId;

checkTheme();
checkUserId();

fetchAndReturnObject("https://api.punkapi.com/v2/beers?per_page=80&page=")
  .then((response) => {
    beerObjects = response;
    insertElements(response, 12, 1);
  })
  .catch((err) => {
    showCardError(err);
  })
  .then(() => {
    addEventListeners();
  });

function addEventListeners() {
  const homeButton = document.querySelector(".home-button");
  const themeContainer = document.querySelector(".theme");
  const sortForm = document.querySelector(".sort-settings");
  const amountOfItems = document.querySelector("#amount");
  const maltFilter = document.querySelector("#filter-by-malt");
  const sortOptions = document.querySelector("#sort-by");
  const cardContainer = document.querySelector(".card-container");
  const showListButton = document.querySelector("#favorite-list");
  const clearCookiesButton = document.querySelector("#clear-cookies-button");
  const modalBody = document.querySelector(".modal-body");
  const sendDataModal = document.querySelector("#submit-modal");

  homeButton.addEventListener("click", () => {
    window.location.reload();
  });

  themeContainer.addEventListener("click", (event) => {
    const target = event.target.closest(".theme-button");

    if (!target || !themeContainer.contains(target)) {
      return;
    }

    let chosenTheme = target.getAttribute("id");
    setTheme(chosenTheme);
  });

  sortForm.addEventListener("submit", (e) => {
    const text = "Sort";
    const options = Array.from(sortOptions.options);
    const optionToSelect = options.find((item) => item.text === text);

    optionToSelect.selected = true;
    
    const searchInput = document.querySelector("#search-by-name");

    e.preventDefault();

    if (searchInput.value != undefined && searchInput.value != null && searchInput.value != "") {
      let searchInputFormatted = searchInput.value.replace(/\s/g, "_");
      fetchAndReturnObject(`https://api.punkapi.com/v2/beers?beer_name=${searchInputFormatted}&per_page=80&page=`)
        .then((response) => {
          beerObjects = response;
          insertElements(beerObjects, amountOfItems.value, 1);
        })
        .catch((err) => {
          showCardError(err);
        });
    } else {
      window.location.reload();
    }
  });

  amountOfItems.addEventListener("change", () => {
    insertElements(beerObjects, amountOfItems.value, 1);
  });

  maltFilter.addEventListener("change", () => {
    const text = "Sort";
    const options = Array.from(sortOptions.options);
    const optionToSelect = options.find((item) => item.text === text);

    optionToSelect.selected = true;

    if (maltFilter.value === "All" || maltFilter.value === undefined) {
      fetchAndReturnObject("https://api.punkapi.com/v2/beers?per_page=80&page=")
        .then((response) => {
          beerObjects = response;
          insertElements(response, amountOfItems.value, 1);
        })
        .catch((err) => {
          showCardError(err);
        });
    } else {
      fetchAndReturnObject(`https://api.punkapi.com/v2/beers?malt=${maltFilter.value}&per_page=80&page=`)
        .then((response) => {
          beerObjects = response;
          insertElements(beerObjects, amountOfItems.value, 1);
        })
        .catch((err) => {
          showCardError(err);
        });
    }
  });

  sortOptions.addEventListener("change", () => {
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

  cardContainer.addEventListener("click", (event) => {
    let target = event.target.closest(".button-favorites");
    let cookie = getCookie("favoriteList");

    if (!target || !cardContainer.contains(target)) {
      return;
    }

    buttonFlash(target);

    let targetId = target.getAttribute("id");
    targetId = targetId.replace(/\D/g, "");

    if (cookie) {
      cookie += "," + targetId;
    } else {
      cookie = targetId;
    }

    setCookie("favoriteList", cookie, { secure: true, "max-age": 31536000, samesite: "lax" });
  });

  showListButton.addEventListener("click", () => {
    showModalSpinner(modalBody);
    fetchAndReturnObject("https://api.punkapi.com/v2/beers?per_page=80&page=")
      .then((response) => {
        let allBeerObjects = response;
        let favoriteBeers = findFavoriteBeers(allBeerObjects);
        insertModalContent(favoriteBeers);
      })
      .catch((err) => showModalError(err));
  });

  clearCookiesButton.addEventListener("click", () => {
    deleteCookie("favoriteList");
    insertModalContent();
  });

  modalBody.addEventListener("click", (event) => {
    let target = event.target.closest(".delete-beer");

    if (!target) {
      return;
    }

    deleteSpecificCookie(target);
  });

  sendDataModal.addEventListener("click", (event) => {
    const target = event.target.closest(".fetch-button");
    const postIcon = "<i class='bi bi-send'></i>";
    const getIcon = "<i class='bi bi-file-arrow-down'></i>";
    const putIcon = "<i class='bi bi-arrow-clockwise'></i>";
    const deleteIcon = "<i class='bi bi-trash3'></i>";

    if (!target) {
      return;
    }

    let targetId = target.getAttribute("id");

    switch (targetId) {
      case "fetch-post-button":
        postFavoriteList(target, postIcon);
        break;
      case "fetch-get-button":
        if (target.closest("#get-row").classList.contains("showing-response")) {
          return;
        }
        getFavoriteListFromServer(target, getIcon);
        break;
      case "fetch-put-button":
        putFavoriteList(target, putIcon);
        break;
      case "fetch-delete-button":
        deleteFavoriteList(target, deleteIcon);
        break;
    }
  });
}

function checkTheme() {
  let theme = localStorage.getItem("theme");

  if (theme === "light") {
    setTheme("light");
  } else {
    setTheme("dark");
  }
}

function setTheme(chosenTheme) {
  const mainSCSS = document.querySelector("link[title=\"main\"]");
  const darkSCSS = document.querySelector("link[title=\"dark\"]");
  const lightSCSS = document.querySelector("link[title=\"light\"]");
  const darkLink = new URL(darkSCSS.href).pathname;
  const lighLink = new URL(lightSCSS.href).pathname;

  localStorage.setItem("theme", chosenTheme);
  switch (chosenTheme) {
    case "dark":
      mainSCSS.href = darkLink;
      break;
    case "light":
      mainSCSS.href = lighLink;
      break;
  }
}

function checkUserId() {
  if(!getCookie("userId")) {
    createUserId();
  } else {
    userId = getCookie("userId");
  }
}

function createUserId() {
  userId = Math.floor(Math.random() * 1000000000);
  setCookie("userId", userId, { secure: true, "max-age": 31536000, samesite: "lax" });
}

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

  return completeArray;
}

function addDateToObjects(completeBeerArray) {
  for (let i = 0; i < completeBeerArray.length; i++) {
    let beerDateString = completeBeerArray[i].first_brewed;
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

    completeBeerArray[i].date = dateObject;
  }
}

function insertElements(array, amount, page) {
  const cardContainer = document.querySelector(".card-container");

  if (array.length === 0) {
    cardContainer.innerHTML = `
    <div class="error">
      <h2>We could not find any beers matching your request.</h2>
      <p>Check if your spelling is correct. If you believe this is an error feel free to contact us.</p>
    </div>`;

    return;
  }

  amount = +amount;
  let i = amount * (page - 1);
  let loopLength = amount + i;
  let amountOfPages = Math.ceil(array.length / amount);
  let rowNumber;

  cardContainer.innerHTML = "";

  for (i; i < loopLength; i++) {
    if (array[i] === undefined) {
      continue;
    }

    if (i % 4 === 0) {
      let cardRow = document.createElement("div");
      rowNumber = i / 4 + 1;

      cardRow.classList.add("card-row");
      cardRow.classList.add(`row-${rowNumber}`);
      cardContainer.append(cardRow);
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

    if (beerDescription.length > 390) {
      beerDescription = beerDescription.slice(0, 350);
      beerDescription += "...";
    }

    for (let i = 0; i < maltArray.length; i++) {
      let name = maltArray[i].name;
      if (i != maltArray.length - 1) {
        name += ", ";
      }
      maltString += name;
    }

    const currentRow = document.querySelector(`.row-${rowNumber}`);

    currentRow.innerHTML += `
      <div class="card">
        <div class="img-wrapper">
          <img src="${beerImageSource}" class="card-img-top" alt="A picture of ${beerName}" />
        </div>
        <div class="card-body">
          <div class="card-info">
            <h2 class="card-title">${beerName}</h2>
            <p class="tagline">${tagline}</p>
            <ul class="Info">
              <li>${beerDate}</li>
              <li>ABV: ${alcoholContent}</li>
              <li>IBU: ${ibu}</li>
              <li>Malt: ${maltString}</li>
            </ul>
            <p class="description">${beerDescription}</p>
          </div>
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
  <button id="forward-${backPageNumber} title="go-back-page-button" type="button" class="pageBack button-arrow"><i class="bi bi-caret-left-fill"></i></button><div class="numbered-buttons">`;

  for (let i = 1; i <= amountOfPages; i++) {
    if (i === page) {
      buttonString += `<button id="page-${i}" type="button" class="page-button active">${i}</button>`;
      highestAllowedPage = i;
    } else {
      buttonString += `<button id="page-${i}" type="button" class="page-button">${i}</button>`;
      highestAllowedPage = i;
    }
  }

  let forwardPageNumber = page + 1 < highestAllowedPage ? page + 1 : highestAllowedPage;
  buttonString += `</div><button id="forward-${forwardPageNumber}" title="go-forward-page-button" type="button" class="pageForward button-arrow"><i class="bi bi-caret-right-fill"></i></button>
  </div>`;

  cardContainer.innerHTML += buttonString;

  const pageButtonContainer = document.querySelector(".page-buttons");

  pageButtonContainer.addEventListener("click", (event) => {
    let target = event.target.closest("button");

    if (!target || !pageButtonContainer.contains(target)) {
      return;
    }

    changePage(target);
  });
}

function changePage(button) {
  const amountOfItems = document.querySelector("#amount");
  let pageToSwitch = button.getAttribute("id");

  pageToSwitch = pageToSwitch.replace(/\D/g, "");

  insertElements(beerObjects, amountOfItems.value, +pageToSwitch);

  document.querySelector("#top").scrollIntoView();
}

function showCardError(err) {
  const cardContainer = document.querySelector(".card-container");

  cardContainer.innerHTML = `
  <div class="fetch-error error">
    <h2>${err}</h2>
    <p class="lead">Try reloading the site!</p>
  </div>`;
}

function arraySortAlphabet() {
  beerObjects.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
}

function arraySortReverseAlphabet() {
  beerObjects.sort((a, b) => (a.name < b.name ? 1 : b.name > a.name ? -1 : 0));
}

function arraySortByNew() {
  beerObjects.sort((a, b) => (a.date < b.date ? 1 : b.date > a.date ? -1 : 0));
}

function arraySortByOldest() {
  beerObjects.sort((a, b) => (a.date > b.date ? 1 : b.date > a.date ? -1 : 0));
}

function buttonFlash(target) {
  target.classList.add("active-button");
  target.innerHTML = "&#10003 Added to favorites";

  setTimeout(() => {
    target.classList.remove("active-button");
    target.innerHTML = "Add to favorites";
  }, 700);
}

function showModalSpinner(modalElem) {
  modalElem.innerHTML = `  
  <div class="spinner-container">
    <div class="spinner-border spinner-border-sm text-white" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>`;
}

function insertModalContent(favoriteObjects) {
  const modalBody = document.querySelector(".modal-body");

  if (!favoriteObjects) {
    modalBody.innerHTML = `
    <h2 class="no-beer">You currently don't have any beers in your list.</h2>
    <h3 class="lead">You can add beers by clicking the add to favorites button.</h3>`;

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

function findFavoriteBeers(allBeerObjects) {
  let currentCookies = getCookie("favoriteList");
  let currentCookiesArray = [];
  let favoriteObjects = [];

  if (!currentCookies) {
    return false;
  }

  currentCookiesArray = currentCookies.split(",");

  for (let i = 0; i < currentCookiesArray.length; i++) {
    favoriteObjects.push(allBeerObjects.find((item) => item.id == currentCookiesArray[i]));
  }

  return favoriteObjects;
}

function showModalError(err) {
  const modalBody = document.querySelector("#favoriteModal .modal-body");

  modalBody.innerHTML = `
  <div class="modal-error">
    <div class="error-background">
      <h2 class="error-title">${err}</h2>
      <p class="error-tip">Try reloading the page!</p>
    </div>
  </div>
  `;
}

function deleteSpecificCookie(target) {
  let deleteId = target.getAttribute("id");
  let currentCookies = getCookie("favoriteList");
  let currentCookiesArray = currentCookies.split(",");
  let newCookie = [];

  deleteId = deleteId.replace(/\D/g, "");

  for (let i = 0; i < currentCookiesArray.length; i++) {
    if (currentCookiesArray[i] != deleteId) {
      newCookie.push(currentCookiesArray[i]);
    }
  }

  newCookie = newCookie.toString();

  setCookie("favoriteList", newCookie, { secure: true, "max-age": 31536000, samesite: "lax" });

  fetchAndReturnObject("https://api.punkapi.com/v2/beers?per_page=80&page=")
    .then((response) => {
      let allBeerObjects = response;
      let favoriteBeers = findFavoriteBeers(allBeerObjects);
      insertModalContent(favoriteBeers);
    })
    .catch((err) => showModalError(err));
}

async function postFavoriteList(target, icon) {
  insertButtonSpinner(target);

  try {
    const response = await fetchAndReturnObject("https://api.punkapi.com/v2/beers?per_page=80&page=");
    let favoriteBeers = findFavoriteBeers(response);

    if (!favoriteBeers) {
      throw new Error("List is empty. You have to add items before sending.");
    }

    const post = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      body: JSON.stringify({
        title: "favoriteList",
        body: favoriteBeers,
        userId: userId}),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });

    if (post.status < 200 || post.status > 299) {
      throw new Error(post.status);
    }

    showFetchConfirmation("Succesfully sent list", target.getAttribute("id"), icon);
  } catch (err) {
    showFetchFailure(err, target.getAttribute("id"), icon);
  }
}

async function getFavoriteListFromServer(target, icon) {
  insertButtonSpinner(target);

  try {
    const listFromServer = await fetch("https://jsonplaceholder.typicode.com/posts/1");

    if (listFromServer.status < 200 || listFromServer.status > 299) {
      throw new Error(listFromServer.status);
    }

    const listJson = await listFromServer.json();

    target.innerHTML = "&#10003";

    showFetchedList(listJson);
  } catch (err) {
    showFetchFailure(err, target.getAttribute("id"), icon);
  }
}

async function putFavoriteList(target, icon) {
  insertButtonSpinner(target);

  try {
    const response = await fetchAndReturnObject("https://api.punkapi.com/v2/beers?per_page=80&page=");
    let favoriteBeers = findFavoriteBeers(response);

    if (!favoriteBeers) {
      throw new Error("List is empty. You have to add items before sending.");
    }

    const put = await fetch("https://jsonplaceholder.typicode.com/posts/1", {
      method: "PUT",
      body: JSON.stringify({
        title: "favoriteList",
        body: favoriteBeers,
        userId: userId}),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });

    if (put.status < 200 || put.status > 299) {
      throw new Error(put.status);
    }

    const jsonPut = await put.json();

    let amountOfItems = Object.keys(jsonPut.body).length;

    showFetchConfirmation(
      `Succesfully updated list with ${amountOfItems} new item(s)`,
      target.getAttribute("id"),
      icon
    );
  } catch (err) {
    showFetchFailure(err, target.getAttribute("id"), icon);
  }
}

async function deleteFavoriteList(target, icon) {
  insertButtonSpinner(target);

  if (confirm("Are you sure that you wan't to remove your list from our servers?")) {
    try {
      fetch("https://jsonplaceholder.typicode.com/posts/1", {
        method: "DELETE",
      });
      showFetchConfirmation("Succesfully deleted list", target.getAttribute("id"), icon);
    } catch (err) {
      showFetchFailure(err, target.getAttribute("id"), icon);
    }
  } else {
    target.innerHTML = icon;
  }
}

async function showFetchedList(list) {
  const getRow = document.querySelector("#get-row");
  const oldH2 = document.querySelector("#get-row h2");
  const div = document.createElement("div");

  oldH2.remove();
  getRow.classList.add("showing-response");

  div.innerHTML = `
  <div>
    <h2>Placeholder JSON response (not actual list)</h2>
    <ul>
      <li>ID: ${list.id}</li>
      <li>Title: ${list.title}</li>
      <li>Body: ${list.body}</li>
      <li>userID: ${list.userId}</li>
    </ul>
  <div>
  `;

  getRow.prepend(div);

  setTimeout(() => {
    const getRow = document.querySelector("#get-row");

    getRow.classList.remove("showing-response");
    getRow.innerHTML = `
    <h2 id="fetch-get" class="fetch-method">Check what information we have about your list on our servers</h2>
    <button id="fetch-get-button" type="button" class="btn fetch-button" aria-labelledby="fetch-get">
      <i class="bi bi-file-arrow-down"></i>
    </button>`;
  }, 5000);
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
  const sendDataModal = document.querySelector("#submit-modal");

  document.querySelector(`#${targetId}`).innerHTML = "&#10003";

  sendDataModal.innerHTML += `
  <div id="confirmation-div" class="fetch-alert">
    <h4>${message}</h4>
  </div>
  `;

  setTimeout(() => {
    document.querySelector(".fetch-alert").remove();
    document.querySelector(`#${targetId}`).innerHTML = icon;
  }, 2000);
}

function showFetchFailure(err, targetId, icon) {
  const sendDataModal = document.querySelector("#submit-modal");
  const target = document.querySelector(`#${targetId}`);

  target.innerHTML = "<i class='bi bi-exclamation-triangle'></i>";
  target.classList.add("failed");
  sendDataModal.innerHTML += `
  <div id="fetch-fail-div" class="fetch-alert">
    <h4>${err}</h4>
    <p class="lead">Please try again</p>
  </div>
  `;

  setTimeout(() => {
    document.querySelector(".fetch-alert").remove();
    const target = document.querySelector(`#${targetId}`);
    target.classList.remove("failed");
    target.innerHTML = icon;
  }, 3000);
}
