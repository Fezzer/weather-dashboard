const API_KEY = "e2fbfb8cefa7140e915e1270b734b104";
const GEOCODER_ROOT_URL = "http://api.openweathermap.org/geo/1.0/direct";
const FORECAST_ROOT_URL = "http://api.openweathermap.org/data/2.5/forecast"

// Makes a call to the geocoder endpoint and forwards the result to the callback.
function getGeocode(search, callback) {
  const queryUrl = `${GEOCODER_ROOT_URL}?q=${search}&limit=5&appid=${API_KEY}`;

  fetch(queryUrl)
    .then(response => response.json())
    .then(data => callback(data[0].lat, data[0].lon, displayForecasts))
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

// Handler for the search button click.
function searchButtonClick(event) {
  event.preventDefault();

  const search = document.getElementById("search-input").value;
  getGeocode(search, getWeatherForecast);
}

document.getElementById("search-button").addEventListener("click", searchButtonClick);