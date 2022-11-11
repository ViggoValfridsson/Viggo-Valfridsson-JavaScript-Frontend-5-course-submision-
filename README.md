# JavaScript Frontend | 5-Course-Submission | Viggo Valfridsson

## Content
The site dynamically creates elements based on information from the PUNK API. When you load the page it creates cards for every beer in the API and gives you filtering options. You can choose the amount of beers visible per page, sort beers by malt type (this is done by sending a new fetch request to PUNK API), search for beers (this function also sends a new request) and sort by "A-Z", "Z-A, "Newest" and "Oldest".

There is an option to change color theme. The preferred theme is then saved in localStorage and automatically loaded next time the user opens the page.

You can save beers to your favorite list by clicking the "Add to favorites" button on the cards. The beers are saved by putting their ID in a string and then storing the string in a cookie. Since the list is stored as a cookie (for one year) you can reload and close the page without losing it.If you click the basket in the top right corner you can view and modify your current favorite list. You have the ability to either delete a specific item or clear the entire list by deleting all the cookies related to the list. 

In the bottom right corner of the favorite list there is an option to send in your list for statistics. When the page loads it checks the cookie "userId" and creates one if it doesn't exist. When you click "Send in list for statistics" the page performs a fetch POST request and sends the following information as JSON, the list of beers, userId and the title favoriteList. When you click "Update list on our servers" the same data is sent but in a PUT request instead. The "Check what information we have about your list on our servers" performs a GET request and displays the results inside of the modal. The "Delete list from our servers" performs a DELETE request. When a request fails an error message is shown in the bottom right corner and when it succeds a success message is shown in the same place. All requests are sent to JSONPlaceholder.

## Test
Tests can be viewed by running "npm test" and opening the page in the browser.
