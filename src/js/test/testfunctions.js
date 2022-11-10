function arraySortAlphabet() {
  beerObjects.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
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

module.exports = {
  addDateToObjects,
};