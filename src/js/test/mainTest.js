/* eslint-disable no-undef */
const assert = require("chai").assert;
const main = require("../main");

describe("addDateToObjects", () => {
  it("Takes objects from an array, checks first_brewed property, reads the date string in MM/YYYY format, converts it to date object and adds it.", () => {
    let testArray = [{ first_brewed: "02/2022" }, { first_brewed: "05/2021" }];
    main.addDateToObjects(testArray);
    assert.equal(testArray[0].date.getFullYear(), 2022);
    assert.equal(testArray[0].date.getMonth(), 1);
    assert.equal(testArray[1].date.getFullYear(), 2021);
    assert.equal(testArray[1].date.getMonth(), 4);
  });
  it("Takes objects from an array, checks first_brewed property, reads the date string in YYYY format, converts it to date object and adds it.", () => {
    let testArray = [{ first_brewed: "2022" }, { first_brewed: "2021" }];
    main.addDateToObjects(testArray);
    assert.equal(testArray[0].date.getFullYear(), 2022);
    assert.equal(testArray[1].date.getFullYear(), 2021);
  });
});

describe("arraySortAlphabet", () => {
  it("Sorts array in alphabetical order.", () => {
    let testArray = [{name: "c"}, {name: "b"}, {name: "a"}];
    let arrayInOrder = [{name: "a"}, {name: "b"}, {name: "c"}];
    main.arraySortAlphabet(testArray);
    assert.deepEqual(testArray, arrayInOrder);
  });
});

describe("arraySortAlphabet", () => {
  it("Sorts array in reverse alphabetical order.", () => {
    let testArray = [{name: "a"}, {name: "b"}, {name: "c"}];
    let arrayInReverseOrder = [{name: "c"}, {name: "b"}, {name: "a"}];
    main.arraySortReverseAlphabet(testArray);
    assert.deepEqual(testArray, arrayInReverseOrder);
  });
});

describe("arraySortByNew", () => {
  it("Sorts array newest to oldest.", () => {
    let testArray = [{date: new Date().setFullYear(2018, 2, 10)}, {date: new Date().setFullYear(2020, 5, 10)}, {date: new Date().setFullYear(2022, 7, 10)}];
    let arrayInOrder = [{date: new Date().setFullYear(2022, 7, 10)}, {date: new Date().setFullYear(2020, 5, 10)}, {date: new Date().setFullYear(2018, 2, 10)}];
    main.arraySortByNew(testArray);
    assert.deepEqual(testArray, arrayInOrder);
  });
});

describe("arraySortByOldest", () => {
  it("Sorts array oldest to newest.", () => {
    let testArray = [{date: new Date().setFullYear(2022, 7, 10)}, {date: new Date().setFullYear(2020, 5, 10)}, {date: new Date().setFullYear(2018, 2, 10)}];
    let arrayInOrder = [{date: new Date().setFullYear(2018, 2, 10)}, {date: new Date().setFullYear(2020, 5, 10)}, {date: new Date().setFullYear(2022, 7, 10)}];
    main.arraySortByOldest(testArray);
    assert.deepEqual(testArray, arrayInOrder);
  });
});