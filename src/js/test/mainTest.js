const assert = require("chai").assert;
const main = require("../main");

describe("addDateToObjects", () => {
  it("Takes objects from an array, checks first_brewed property, reads the date string in YYYY or MM/YYYY format, converts it to date object and adds it.", () => {
    let testArray = [{ first_brewed: "02/2022" }, { first_brewed: "2022" }];
    main.addDateToObjects(testArray);
    assert.equal(testArray[0].date.getFullYear(), 2022);
  });
});
