const assert = require("chai").assert;
const addDateToObjects = require("../main").addDateToObjects;

describe("addDateToObjects", () => {
  it("Takes object from an array, checks first_brewed property, reads the date string in YYYY or MM/YYYY format, converts it to date object and adds it.", () => {
    let testArray = [{ first_brewed: "02/2022" }, { first_brewed: "2022" }];
    addDateToObjects(testArray);
    assert.equal(testArray[0].date.getFullYear(), 2022);
  });
});
