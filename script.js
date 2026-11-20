// SkyCast - Weather Dashboard JS
const API_KEY = "8d976215a14944d481863627261506";

// Helper Selector Utility
const $ = id => document.getElementById(id);

// DOM Elements Selection
const searchInput = $('search-input');
const searchBtn = $('search-btn');
const locationBtn = $('location-btn');
const themeToggle = $('theme-toggle');
const themeIcon = $('theme-icon');

const cityName = $('city-name');
const dateTime = $('date-time');
const conditionText = $('condition-text');
const weatherIcon = $('weather-icon');
const tempVal = $('temp-val');
const feelsLikeVal = $('feels-like-val');
const tempHighVal = $('temp-high-val');
const tempLowVal = $('temp-low-val');

const humidityVal = $('humidity-val');
const humidityDesc = $('humidity-desc');
const windVal = $('wind-val');
const windDesc = $('wind-desc');
const pressureVal = $('pressure-val');
const pressureDesc = $('pressure-desc');
const uvVal = $('uv-val');
const uvDesc = $('uv-desc');

const weatherRec = $('weather-recommendation');
const weatherDesc = $('weather-description');

// Refresh Lucide Vector Icons on the screen
function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Convert API date string 'YYYY-MM-DD HH:MM' to a formatted local time
function formatLocalTime(localtimeStr) {
  const date = localtimeStr ? new Date(localtimeStr.replace(/-/g, '/')) : new Date();
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  const dateStr = date.toLocaleDateString('en-US', options);
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${dateStr} • ${timeStr}`;
}

// Update Short Weather Recommendation messages based on weather condition text
function updateRecommendations(condition) {
  const cond = condition.toLowerCase();
  let recommendation = 'Perfect weather for outdoor activities.';
  let description = 'A bit gray and overcast today.';

  if (cond.includes('clear') || cond.includes('sun')) {
    recommendation = 'Perfect weather for outdoor activities.';
    description = 'Bright sunshine and beautiful clear skies.';
  } else if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) {
    recommendation = 'Grab an umbrella! Rain is on the way.';
    description = 'Expect wet streets and low visibility.';
  } else if (cond.includes('snow') || cond.includes('blizzard') || cond.includes('ice') || cond.includes('freeze')) {
    recommendation = 'Warm layers recommended. Freezing cold.';
    description = 'Snowy conditions and icy roads.';
  } else if (cond.includes('thunder') || cond.includes('storm')) {
    recommendation = 'Stay indoors! Storms in the area.';
    description = 'Lightning, thunder, and heavy downpours.';
  }

  weatherRec.textContent = recommendation;
  weatherDesc.textContent = description;
}

// Bind weather/forecast data object to UI elements
function updateUI(data) {
  // Update Header Location & Time
  cityName.textContent = `${data.location.name}, ${data.location.country}`;
  dateTime.textContent = formatLocalTime(data.location.localtime);

  // Update Condition Text & Short Message
  const condition = data.current.condition.text;
  conditionText.textContent = condition;
  updateRecommendations(condition);

  // Safe Weather Icon assignment (resolves relative/absolute path issues)
  let iconUrl = data.current.condition.icon;
  if (iconUrl.startsWith('//')) {
    weatherIcon.src = 'https:' + iconUrl;
  } else if (iconUrl.startsWith('http://') || iconUrl.startsWith('https://')) {
    weatherIcon.src = iconUrl;
  } else {
    weatherIcon.src = 'https://' + iconUrl;
  }

  // Update Temperatures
  tempVal.textContent = Math.round(data.current.temp_c);
  feelsLikeVal.textContent = `${Math.round(data.current.feelslike_c)}°C`;

  // Update High and Low Temperatures from forecastday array
  const dayForecast = data.forecast.forecastday[0].day;
  tempHighVal.textContent = `${Math.round(dayForecast.maxtemp_c)}°C`;
  tempLowVal.textContent = `${Math.round(dayForecast.mintemp_c)}°C`;

  // Update Humidity
  const humidity = data.current.humidity;
  humidityVal.textContent = `${humidity}%`;
  humidityDesc.textContent = humidity > 70 ? 'Damp' : humidity < 35 ? 'Dry' : 'Comfortable';

  // Convert Wind speed (km/h to m/s) and update
  const windMS = (data.current.wind_kph / 3.6).toFixed(1);
  windVal.textContent = `${windMS} m/s`;
  windDesc.textContent = data.current.wind_dir;

  // Update Air Pressure
  const pressure = data.current.pressure_mb;
  pressureVal.textContent = `${pressure} hPa`;
  pressureDesc.textContent = pressure > 1020 ? 'High' : pressure < 1000 ? 'Low' : 'Normal';

  // Update UV Index
  const uv = data.current.uv;
  uvVal.textContent = uv;
  uvDesc.textContent = uv >= 6 ? 'High' : uv >= 3 ? 'Moderate' : 'Low';

  refreshIcons();
}

// Fetch live weather data from API or execute simulated fallback query
async function fetchWeatherData(query) {
  if (!query) {
    alert('Please enter a city name to search.');
    return;
  }

  // Display loading indicator
  cityName.textContent = 'Loading...';

  if (!API_KEY || API_KEY.trim() === '') {
    alert("Please configure a valid WeatherAPI key.");
    return;
  }

  // Call live WeatherAPI forecast endpoint
  try {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(query)}&days=1&aqi=yes`;
    const response = await fetch(url);

    const data = await response.json();

    console.log("Response Status:", response.status);
    console.log("API Response:", data);

    if (data.error) {
      throw new Error(data.error.message);
    }

    updateUI(data);
  } catch (error) {
    cityName.textContent = 'Error';
    console.error(error);
    alert(error.message || 'Network error. Please check your internet connection.');
  }
}

// Event Listeners for search actions
searchBtn.addEventListener('click', () => {
  fetchWeatherData(searchInput.value.trim());
});

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    fetchWeatherData(searchInput.value.trim());
  }
});

// Event Listener for Geolocation query
locationBtn.addEventListener('click', () => {
  if (navigator.geolocation) {
    cityName.textContent = 'Loading...';
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const query = `${position.coords.latitude},${position.coords.longitude}`;
        fetchWeatherData(query);
      },
      () => {
        cityName.textContent = 'Error';
        alert('Geolocation permission denied or timed out.');
      }
    );
  } else {
    alert('Geolocation is not supported by your browser.');
  }
});

// Theme toggle action listener
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
  const isLight = document.body.classList.contains('light-theme');
  themeIcon.setAttribute('data-lucide', isLight ? 'sun' : 'moon');
  refreshIcons();
});

// Initial Page Load
window.addEventListener('DOMContentLoaded', () => {
  fetchWeatherData('London');
});
