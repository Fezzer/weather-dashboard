const API_KEY = "e2fbfb8cefa7140e915e1270b734b104";
const GEOCODER_ROOT_URL = "http://api.openweathermap.org/geo/1.0/direct";
const FORECAST_ROOT_URL = "http://api.openweathermap.org/data/2.5/forecast";
const SEARCH_HISTORY_KEY = "search-history";
const SEARCH_HISTORY_SIZE = 7;

var searchHistory;

// Displays a daily forecast.
function displayDailyForecast(forecast, parent, largeImage) {
  const icon = document.createElement("img");
  icon.setAttribute("src", `http://openweathermap.org/img/wn/${forecast.weather[0].icon}${largeImage ? "@2x" : ""}.png`);
  icon.setAttribute("alt", `${forecast.weather[0].main} ${forecast.weather[0].description}`);

  const temp = document.createElement("div");
  temp.textContent = `Temperature: ${(forecast.main.temp - 273.15, 1).toFixed(1)}\u{b0}`;

  const wind = document.createElement("div");
  wind.textContent = `Wind: ${forecast.wind.speed} KPH`;

  const humidity = document.createElement("div");
  humidity.textContent = `Humidity: ${forecast.main.humidity} %`;

  parent.append(icon, temp, wind, humidity);
}

// Displays the weather forecast for today.
function displayTodaysForecast(forecast) {
  const today = forecast.list[0];

  const todayContainer = document.getElementById("today");
  todayContainer.textContent = "";

  const day = document.createElement("div");
  day.classList.add("h3");
  day.textContent = `Today @ ${luxon.DateTime.fromSeconds(today.dt).toFormat("h:mma")}`;

  todayContainer.append(day);
  displayDailyForecast(today, todayContainer, true);
}

// Displays the future 5 day forecasts.
function display5DayForecast(forecast) {
  const futureContainer = document.getElementById("future");
  futureContainer.textContent = "";

  forecast.list
    .filter((_, i) => (i + 1) % 8 === 0)
    .forEach((f, i) => {
      var date = luxon.DateTime.fromSeconds(f.dt);
      const column = document.createElement("div");
      column.classList.add("col", "p-2");

      if (i > 0) {
        column.classList.add("ml-3")
      }

      const day = document.createElement("div");
      day.classList.add("h5");
      day.innerHTML = `${i === 0 ? "Tomorrow" : date.toFormat("cccc")}<br>@ ${date.toFormat("h:mma")}`;
      column.append(day);

      displayDailyForecast(f, column);

      futureContainer.append(column);
    });
}

// Displays all the forecasts on the page.
function displayForecasts(location, forecast) {
  const locationElement = document.getElementById("location");
  locationElement.textContent = `${location.name}${location.state ? ", " + location.state : ""}`
  displayTodaysForecast(forecast);
  display5DayForecast(forecast);
  
  const forecastElement = document.getElementById("forecast");
  forecastElement.classList.remove("invisible");
}

// Updates the search history with the specified location.
function updateSearchHistory(location) {
  let loc = searchHistory.find(e => 
    e.name === location.name && e.state === location.state && e.country === location.country);

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

// Clears and displays search history buttons.
function displaySearchHistory(history) {
  const container = document.getElementById("history");
  container.textContent = "";

  history.forEach((element, i) => {
    const button = document.createElement("button");
    button.textContent = element.name;
    button.classList.add("btn", "btn-info", "w-100", "mb-2");
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
      callback(location, displayForecasts);
      updateSearchHistory(location);
      displaySearchHistory(searchHistory);
    })
    .catch(console.log);
}

// Makes a call to the 5 day weather forecast endpoint and forwards the result to the callback.
function getWeatherForecast(location, callback) {
  const queryUrl = `${FORECAST_ROOT_URL}?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}`;

  fetch(queryUrl)
    .then(response => response.json())
    .then(data => callback(location, data))
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
  getWeatherForecast(location, displayForecasts);
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