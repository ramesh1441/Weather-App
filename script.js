
var History = [];
var weatherAPI = 'https://api.openweathermap.org';
var weatherAPIKey = 'd91f911bcf2c0f925fb6535547a5ddc9';
var form = document.querySelector('#search-form');
var input = document.querySelector('#search-input');
var todayWeather = document.querySelector('#today');
var weatherForecast = document.querySelector('#forecast');
var searchHistory = document.querySelector('#history');

dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

function appendSearchHistory() {
  searchHistory.innerHTML = '';

  for (var i = History.length - 1; i >= 0; i--) {
    var btn = document.createElement('button');

    btn.classList.add('history-btn', 'btn-history');

    btn.setAttribute('data-search', History[i]);
    btn.textContent = History[i];
    searchHistory.append(btn);
  }
}

function appendHistory(search) {
  
  if (History.indexOf(search) !== -1) {
    return;
  }
  History.push(search);

  localStorage.setItem('search-history', JSON.stringify(History));
  appendSearchHistory();
}

function localStorageHistory() {
  var storageHistory = localStorage.getItem('search-history');
  if (storageHistory) {
    History = JSON.parse(storageHistory);
  }
  appendSearchHistory();
}

function displayWeather(city, weather) {
  var date = dayjs().format('M/D/YYYY');
  
  var temperature = weather.main.temp;
  var windSpeed = weather.wind.speed;
  var humidity = weather.main.humidity;
  var imageIconURL = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
  var iconDescription = weather.weather[0].description || weather[0].main;

  var block = document.createElement('div');
  var blockBody = document.createElement('div');
  var heading = document.createElement('h2');
  var weatherIcon = document.createElement('img');
  var tempEl = document.createElement('p');
  var windEl = document.createElement('p');
  var humidityEl = document.createElement('p');

  block.setAttribute('class', 'block');
  blockBody.setAttribute('class', 'block-body');
  block.append(blockBody);

  heading.setAttribute('class', 'h3 block-title');
  tempEl.setAttribute('class', 'block-text');
  windEl.setAttribute('class', 'block-text');
  humidityEl.setAttribute('class', 'block-text');

  heading.textContent = `${city} (${date})`;
  weatherIcon.setAttribute('src', imageIconURL);
  weatherIcon.setAttribute('alt', iconDescription);
  weatherIcon.setAttribute('class', 'weather-img');
  heading.append(weatherIcon);
  tempEl.textContent = `Temp: ${temperature}??F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;
  blockBody.append(heading, tempEl, windEl, humidityEl);

  todayWeather.innerHTML = '';
  todayWeather.append(block);
}

function displayForecastBlock(forecast) {

  var imageIconURL = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
  var iconDescription = forecast.weather[0].description;
  var temperature = forecast.main.temp;
  var humidity = forecast.main.humidity;
  var windSpeed = forecast.wind.speed;

  // Create elements for a card
  var col = document.createElement('div');
  var block = document.createElement('div');
  var blockBody = document.createElement('div');
  var blockTitle = document.createElement('h5');
  var weatherIcon = document.createElement('img');
  var tempEl = document.createElement('p');
  var windEl = document.createElement('p');
  var humidityEl = document.createElement('p');

  col.append(block);
  block.append(blockBody);
  blockBody.append(blockTitle, weatherIcon, tempEl, windEl, humidityEl);

  col.setAttribute('class', 'col-md');
  col.classList.add('five-day-block');
  block.setAttribute('class', 'block bg-primary h-100 text-white');
  blockBody.setAttribute('class', 'block-body p-2');
  blockTitle.setAttribute('class', 'block-title');
  tempEl.setAttribute('class', 'block-text');
  windEl.setAttribute('class', 'block-text');
  humidityEl.setAttribute('class', 'block-text');

  blockTitle.textContent = dayjs(forecast.dt_txt).format('M/D/YYYY');
  weatherIcon.setAttribute('src', imageIconURL);
  weatherIcon.setAttribute('alt', iconDescription);
  tempEl.textContent = `Temp: ${temperature} ??F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  weatherForecast.append(col);
}

function displayForecast(dailyForecast) {
  
  var startDt = dayjs().add(1, 'day').startOf('day').unix();
  var endDt = dayjs().add(6, 'day').startOf('day').unix();

  var headingCol = document.createElement('div');
  var heading = document.createElement('h4');

  headingCol.setAttribute('class', 'col-12');
  heading.textContent = '5-Day Forecast:';
  headingCol.append(heading);

  weatherForecast.innerHTML = '';
  weatherForecast.append(headingCol);

  for (var i = 0; i < dailyForecast.length; i++) {

    if (dailyForecast[i].dt >= startDt && dailyForecast[i].dt < endDt) {

      if (dailyForecast[i].dt_txt.slice(11, 13) == "12") {
        displayForecastBlock(dailyForecast[i]);
      }
    }
  }
}

function displayItems(city, data) {
  displayWeather(city, data.list[0], data.city.timezone);
  displayForecast(data.list);
}

function fetchWeather(location) {
  var { lat } = location;
  var { lon } = location;
  var city = location.name;

  var APILocation = `${weatherAPI}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${weatherAPIKey}`;

  fetch(APILocation)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      displayItems(city, data);
    })
    .catch(function (err) {
      console.error(err);
    });
}

function fetchCoords(search) {
  var APILocation = `${weatherAPI}/geo/1.0/direct?q=${search}&limit=5&appid=${weatherAPIKey}`;

  fetch(APILocation)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (!data[0]) {
        alert('Location not found');
      } else {
        appendHistory(search);
        fetchWeather(data[0]);
      }
    })
    .catch(function (err) {
      console.error(err);
    });
}

function handleSearchFormSubmit(e) {
  // Don't continue if there is nothing in the search form
  if (!input.value) {
    return;
  }

  e.preventDefault();
  var search = input.value.trim();
  fetchCoords(search);
  input.value = '';
}

function handleSearchHistoryClick(e) {

  if (!e.target.matches('.btn-history')) {
    return;
  }

  var btn = e.target;
  var search = btn.getAttribute('data-search');
  fetchCoords(search);
}

localStorageHistory();
form.addEventListener('submit', handleSearchFormSubmit);
searchHistory.addEventListener('click', handleSearchHistoryClick);