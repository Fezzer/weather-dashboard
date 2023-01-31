const API_KEY = "e2fbfb8cefa7140e915e1270b734b104";
const GEOCODER_ROOT_URL = "http://api.openweathermap.org/geo/1.0/direct";
const FORECAST_ROOT_URL = "http://api.openweathermap.org/data/2.5/forecast";
const SEARCH_HISTORY_KEY = "search-history";

var searchHistory;

// Displays a daily forecast.
function displayDailyForecast(forecast, prefix) {
  const icon = document.getElementById(`${prefix}-icon`);
  icon.setAttribute("src", `http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`);
  icon.setAttribute("alt", `${forecast.weather[0].main} - ${forecast.weather[0].description}`);

  document.getElementById(`${prefix}-date`).textContent = forecast.dt_txt;
  document.getElementById(`${prefix}-temp`).textContent = `Temperature: ${(forecast.main.temp - 273.15, 1).toFixed(1)}\u{b0}`;
  document.getElementById(`${prefix}-wind`).textContent = `Wind: ${forecast.wind.speed} kph`;
  document.getElementById(`${prefix}-humidity`).textContent = `Humidity: ${forecast.main.humidity}%`;
}

// Displays all the forecasts on the page.
function displayForecasts(forecast) {
  displayTodaysForecast(forecast);
  display5DayForecast(forecast);
}

// Displays the weather forecast for today.
function displayTodaysForecast(forecast) {
  const today = forecast.list[0];

  document.getElementById("today-location").textContent = forecast.city.name;
  displayDailyForecast(today, "today");
}

// Displays the future 5 day forecasts.
function display5DayForecast(forecast) {
  forecast.list
    .filter(x => x.dt_txt.endsWith("12:00:00"))
    .forEach((f, i) => displayDailyForecast(f, `day${i + 1}`));
}

// Adds search history buttons.
function displaySearchHistory(history) {
  var container = document.getElementById("history");
  container.textContent = "";

  history.forEach(e => {
    var button = document.createElement("button");
    button.textContent = e.name;
    button.dataset.lat = e.lat;
    button.dataset.lon = e.lon;

    container.append(button);
  });
}

// Makes a call to the geocoder endpoint and forwards the result to the callback.
function getGeocode(search, callback) {
  const queryUrl = `${GEOCODER_ROOT_URL}?q=${search}&limit=5&appid=${API_KEY}`;

  fetch(queryUrl)
    .then(response => response.json())
    .then(data => {
      if (!data.length) {
        return;
      }

      var location = data[0];
      delete location["local_names"];

      callback(location.lat, location.lon, displayForecasts);
      
      searchHistory.unshift(location);
      displaySearchHistory(searchHistory);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
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

// Handler for the search button click.
function searchButtonClick(event) {
  event.preventDefault();

  const search = document.getElementById("search-input").value;
  getGeocode(search, getWeatherForecast);
}

// Handler for a history button click.
function historyButtonClick(event) {
  var target = event.target;

  if (!target.matches("button")) {
    return;
  }

  getWeatherForecast(target.dataset.lat, target.dataset.lon, displayForecasts);
}

// Initialise the application.
function init() {
  document.getElementById("search-button").addEventListener("click", searchButtonClick);
  document.getElementById("history").addEventListener("click", historyButtonClick);

  searchHistory = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY)) ?? [];
  displaySearchHistory(searchHistory);
}

init();