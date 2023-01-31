const API_KEY = "e2fbfb8cefa7140e915e1270b734b104";
const GEOCODER_ROOT_URL = "http://api.openweathermap.org/geo/1.0/direct";
const FORECAST_ROOT_URL = "http://api.openweathermap.org/data/2.5/forecast";
const SEARCH_HISTORY_KEY = "search-history";
const SEARCH_HISTORY_SIZE = 7;

var searchHistory;

// Displays a daily forecast.
function displayDailyForecast(forecast, parent) {
  const icon = document.createElement("img");
  icon.setAttribute("src", `http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`);
  icon.setAttribute("alt", `${forecast.weather[0].main} ${forecast.weather[0].description}`);

  const temp = document.createElement("div").textContent = `Temperature: ${(forecast.main.temp - 273.15, 1).toFixed(1)}\u{b0}`;
  const wind = document.createElement("div").textContent = `Wind: ${forecast.wind.speed} KPH`;
  const humidity = document.createElement("div").textContent = `Humidity: ${forecast.main.humidity} %`;

  parent.append(icon, temp, wind, humidity);
}

// Displays all the forecasts on the page.
function displayForecasts(forecast) {
  displayTodaysForecast(forecast);
  display5DayForecast(forecast);
}

// Displays the weather forecast for today.
function displayTodaysForecast(forecast) {
  const today = forecast.list[0];

  const todayContainer = document.getElementById("today");
  todayContainer.textContent = "";

  const location = document.createElement("h3");
  location.textContent = forecast.city.name;

  const day = document.createElement("h4");
  day.textContent = `Today @ ${luxon.DateTime.fromSeconds(today.dt).toFormat("h:mma")}`;

  todayContainer.append(location, day);
  displayDailyForecast(today, todayContainer);
}

// Updates the search history with the specified location.
function updateSearchHistory(location) {
  let loc = searchHistory.find(e => e.name === location.name);

  if (!loc) {
    loc = location;
    searchHistory.push(loc);
  }
  
  loc.lastUsed = luxon.DateTime.now().toSeconds();
  searchHistory.sort((a, b) => b.lastUsed - a.lastUsed);

  if (searchHistory.length > SEARCH_HISTORY_SIZE) {
    searchHistory = searchHistory.slice(0, SEARCH_HISTORY_SIZE);
  }

  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
}

// Displays the future 5 day forecasts.
function display5DayForecast(forecast) {
  const forecastContainer = document.getElementById("forecast");
  forecastContainer.textContent = "";

  const header = document.createElement("h3");
  header.textContent = "5 Day Forecast";

  forecastContainer.append(header);

  forecast.list
    .filter((_, i) => (i + 1) % 8 === 0)
    .forEach((f, i) => {
      var date = luxon.DateTime.fromSeconds(f.dt);
      const container = document.createElement("div");

      const day = document.createElement("h4").textContent = `${i === 0 ? "Tomorrow" : date.toFormat("cccc")} @ ${date.toFormat("h:mma")}`;
      container.append(day);

      displayDailyForecast(f, container);

      forecastContainer.append(container);
    });
}

// Clears and displays search history buttons.
function displaySearchHistory(history) {
  const container = document.getElementById("history");
  container.textContent = "";

  history.forEach((element, i) => {
    const button = document.createElement("button");
    button.textContent = element.name;
    button.dataset.index = i;

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

      const location = data[0];
      delete location["local_names"];
      callback(location.lat, location.lon, displayForecasts);
      updateSearchHistory(location);
      displaySearchHistory(searchHistory);
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
  const target = event.target;

  if (!target.matches("button")) {
    return;
  }

  const location = searchHistory[target.dataset.index];
  getWeatherForecast(location.lat, location.lon, displayForecasts);
  updateSearchHistory(location);
  displaySearchHistory(searchHistory);
}

// Initialise the application.
function init() {
  document.getElementById("search-button").addEventListener("click", searchButtonClick);
  document.getElementById("history").addEventListener("click", historyButtonClick);

  searchHistory = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY)) ?? [];
  displaySearchHistory(searchHistory);
}

init();