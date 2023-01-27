const API_KEY = "e2fbfb8cefa7140e915e1270b734b104";
const GEOCODER_ROOT_URL = "http://api.openweathermap.org/geo/1.0/direct";
const FORECAST_ROOT_URL = "http://api.openweathermap.org/data/2.5/forecast"

// Makes a call to the geocoder endpoint and forwards the result to the callback.
function getGeocode(search, callback) {
  const queryUrl = `${GEOCODER_ROOT_URL}?q=${search}&limit=5&appid=${API_KEY}`;

  fetch(queryUrl)
    .then(response => response.json())
    .then(data => {
      const element = data[0];
      console.log(element);
      console.log(`lat: ${element.lat}; log: ${element.lon}`);
      callback(data[0].lat, data[0].lon, displayObject);
    })
    .catch(console.log);
}

// Makes a call to the 5 day weather forecast endpoint and forwards the result to the callback.
function getWeatherForecast(lat, lon, callback) {
  const queryUrl = `${FORECAST_ROOT_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  fetch(queryUrl)
    .then(response => response.json())
    .then(callback)
    .catch(console.log);
}

// Displays a object at the bottom of the page.
function displayObject(object) {
  let pre = document.getElementById("object-display");

  if (!pre) {
    pre = document.createElement("pre");
    pre.setAttribute("id", "object-display");
    document.body.append(pre);
  }

  pre.textContent = JSON.stringify(object, null, 2);
}

// Displays the weather forecast.

// Handler for the search button click.
function searchButtonClick(event) {
  event.preventDefault();

  const search = document.getElementById("search-input").value;
  getGeocode(search, getWeatherForecast);
}

document.getElementById("search-button").addEventListener("click", searchButtonClick);