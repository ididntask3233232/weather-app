document.getElementById('getWeatherBtn').addEventListener('click', () => {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) {
    alert('Please enter a city name');
    return;
  }

  document.getElementById('weatherResult').innerHTML = 'Getting Weather...';

  // Fetch city coordinates from Nominatim API
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`)
    .then(response => response.json())
    .then(data => {
      if (!data.length) {
        throw new Error('City not found');
      }
      const lat = data[0].lat;
      const lon = data[0].lon;

      // Fetch weather data from Open-Meteo API with current and daily data
      return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,sunrise,sunset&timezone=auto`);;
    })
    .then(response => response.json())
    .then(weatherData => {
      console.log('weatherData:', weatherData);

      const current = weatherData.current_weather;
      const daily = weatherData.daily;

      if (!current) {
        throw new Error('Current weather data not available');
      }

      function windDirection(deg) {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(deg / 45) % 8;
        return directions[index];
      }

      if (!daily) {
        document.getElementById('weatherResult').innerHTML = `
          <strong>Current Weather</strong><br/>
          Temperature: ${current.temperature}°C<br/>
          Wind: ${current.windspeed} km/h (${windDirection(current.winddirection)})<br/><br/>
          <em>Daily weather data not available for this location.</em>
        `;
        return;
      }

      const weatherCodes = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        56: "Light freezing drizzle",
        57: "Dense freezing drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        66: "Light freezing rain",
        67: "Heavy freezing rain",
        71: "Slight snow fall",
        73: "Moderate snow fall",
        75: "Heavy snow fall",
        77: "Snow grains",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        85: "Slight snow showers",
        86: "Heavy snow showers",
        95: "Thunderstorm",
        96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail"
      };

      const weatherDesc = weatherCodes[daily.weathercode[0]] || "Unknown";

      document.getElementById('weatherResult').innerHTML = `
        <strong>Current Weather</strong><br/>
        Temperature: ${current.temperature}°C<br/>
        Wind: ${current.windspeed} km/h (${windDirection(current.winddirection)})<br/><br/>
        <strong>Today's Details</strong><br/>
        Condition: ${weatherDesc}<br/>
        Sunrise: ${daily.sunrise[0]}<br/>
        Sunset: ${daily.sunset[0]}<br/>
      `;
    })
    .catch(error => {
      alert(error.message);
      console.error(error);
      document.getElementById('weatherResult').innerHTML = '';
    });
});