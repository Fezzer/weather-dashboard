const API_KEY = "e2fbfb8cefa7140e915e1270b734b104";
const GEOCODER_ROOT_URL = "http://api.openweathermap.org/geo/1.0/direct";

// Makes a call to the geocoder endpoint and forwards the result to the callback.
function getGeocode(search, callback) {
  const queryUrl = `${GEOCODER_ROOT_URL}?q=${search}&limit=5&appid=${API_KEY}`;

  fetch(queryUrl)
    .then(response => response.json())
    .then(callback)
    .catch(x => console.log(x));
}

// Displays a geocode.
function displayGeocode(geocode) {
  const pre = document.createElement("pre");
  pre.textContent = JSON.stringify(geocode, null, 2);
  document.getElementById("forecast").append(pre);
}

// Handler for the search button click.
function searchButtonClick(event) {
  event.preventDefault();

  const search = document.getElementById("search-input").value;
  getGeocode(search, displayGeocode);
}

document.getElementById("search-button").addEventListener("click", searchButtonClick);