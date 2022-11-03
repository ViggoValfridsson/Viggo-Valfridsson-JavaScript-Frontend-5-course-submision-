const main =  require("../../../dist/index.18dbc454");

test("Fetches and returns object from API", async () => {
  // expect(fetchAndReturnObject("https://api.punkapi.com/v2/beers").then(response => typeof response)).toBe(typeof Object);
  const awaitResponse = await fetchAndReturnObject("https://api.punkapi.com/v2/beers");

  expect(typeof awaitResponse).toEqual("object");
});
