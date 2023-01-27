const API_KEY = "e2fbfb8cefa7140e915e1270b734b104";
const GEOCODER_ROOT_URL = "http://api.openweathermap.org/geo/1.0/direct";
const FORECAST_ROOT_URL = "http://api.openweathermap.org/data/2.5/forecast"

// Makes a call to the geocoder endpoint and forwards the result to the callback.
function getGeocode(search, callback) {
  const queryUrl = `${GEOCODER_ROOT_URL}?q=${search}&limit=5&appid=${API_KEY}`;

  fetch(queryUrl)
    .then(response => response.json())
    .then(data => callback(data[0].lat, data[0].lon, displayTodaysForecast))
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

// Displays the weather forecast for today.
function displayTodaysForecast(forecast) {
  var today = forecast.list[0];

  document.getElementById("today-location").textContent = `${forecast.city.name} (${today.dt_txt})`;

  const icon = document.getElementById("today-icon");
  icon.setAttribute("src", `http://openweathermap.org/img/wn/${today.weather[0].icon}.png`);
  icon.setAttribute("alt", `${today.weather[0].main} - ${today.weather[0].description}`);

  document.getElementById("today-temp").textContent = `Temperature: ${(today.main.temp - 273.15, 1).toFixed(1)}\u{b0}`;
  document.getElementById("today-wind").textContent = `Wind: ${today.wind.speed} kph`;
  document.getElementById("today-humidity").textContent = `Humidity: ${today.main.humidity}%`;
}

// Handler for the search button click.
function searchButtonClick(event) {
  event.preventDefault();

  const search = document.getElementById("search-input").value;
  getGeocode(search, getWeatherForecast);
}

document.getElementById("search-button").addEventListener("click", searchButtonClick);