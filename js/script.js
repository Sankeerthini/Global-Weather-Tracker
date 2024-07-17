document.getElementById('search-btn').addEventListener('click', function() {
    const city = document.getElementById('city-input').value.trim();
    if (city) {
        getWeather(city);
    } else {
        alert('Please enter a city name.');
    }
});

document.getElementById('city-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const city = document.getElementById('city-input').value.trim();
        if (city) {
            getWeather(city);
        } else {
            alert('Please enter a city name.');
        }
    }
});

document.getElementById('city-input').addEventListener('input', function(event) {
    const query = event.target.value.trim();
    if (query.length >= 2) {
        getCitySuggestions(query);
    } else {
        clearCitySuggestions();
    }
});

async function getCitySuggestions(query) {
    const apiKey = '9da8d5d844992edff1be08a85398d532';
    const apiUrl = `https://api.openweathermap.org/data/2.5/find?q=${query}&type=like&appid=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const suggestions = data.list.map(city => `${city.name}, ${city.sys.country}`);
        updateCitySuggestions(suggestions);
    } catch (error) {
        console.error('Error fetching city suggestions:', error);
    }
}

function updateCitySuggestions(suggestions) {
    const datalist = document.getElementById('city-suggestions');
    datalist.innerHTML = '';
    suggestions.forEach(suggestion => {
        const option = document.createElement('option');
        option.value = suggestion;
        datalist.appendChild(option);
    });
}

async function getWeather(city) {
    const apiKey = '9da8d5d844992edff1be08a85398d532';
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const forecastResponse = await fetch(forecastUrl);
        const data = await response.json();
        const forecastData = await forecastResponse.json();

        if (data.cod === 200) {
            const cityTime = await getCityTime(data.coord.lat, data.coord.lon);
            displayWeather(data, cityTime);
            displayForecast(forecastData);
            showBackButton();
        } else {
            alert('City not found. Please try again.');
        }
    } catch (error) {
        alert('Error fetching weather data. Please try again later.');
    }
}

async function getCityTime(lat, lon) {
    const geoNamesUsername = 'sankeerthini'; // GeoNames username
    const apiUrl = `http://api.geonames.org/timezoneJSON?lat=${lat}&lng=${lon}&username=${geoNamesUsername}`;

}

function changeBackground(weatherCondition) {
    const backgroundImage = document.getElementById('background-image');
    const weatherConditionLower = weatherCondition.toLowerCase();

    let imageName = 'default';

    if (weatherConditionLower.includes('clear')) {
        imageName = 'clear';
    } else if (weatherConditionLower.includes('clouds')) {
        imageName = 'clouds';
    } else if (weatherConditionLower.includes('rain')) {
        imageName = 'rain';
    } else if (weatherConditionLower.includes('drizzle')) {
        imageName = 'drizzle';
    } else if (weatherConditionLower.includes('thunderstorm')) {
        imageName = 'thunderstorm';
    } else if (weatherConditionLower.includes('snow')) {
        imageName = 'snow';
    } else if (weatherConditionLower.includes('mist')||weatherConditionLower.includes('haze')) {
        imageName = 'mist';
    } else {
        imageName = 'default'; // Fallback to a default image if the condition is not recognized
    }

    // Log the selected image name for debugging purposes
    console.log(`Changing background to: /images/${imageName}.jpg`);

    // Update the background image source
    backgroundImage.src = `images/${imageName}.jpg`;

    // Check if the image is loaded correctly
    backgroundImage.onerror = function() {
        console.error(`Failed to load image: images/${imageName}.jpg`);
        backgroundImage.src = 'images/default.jpg';
    }
}


function displayWeather(data, cityTime) {
    const weatherInfo = document.getElementById('weather-info');
    const iconCode = data.weather[0].icon;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;

    changeBackground(data.weather[0].main);

    weatherInfo.innerHTML = `
        <div class="weather-icon" style="margin-bottom: 10px;">
            <img src="http://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Weather icon">
        </div>
        <div class="temperature" style="margin-bottom: 5px;">${temperature}°C</div>
        <div class="description">${description}</div>
        <div class="additional-info">
            <p>Humidity: ${humidity}%</p>
            <p>Wind Speed: ${windSpeed} m/s</p>
        </div>
    `;
}


function displayForecast(data) {
    const forecastInfo = document.getElementById('forecast-info');
    forecastInfo.innerHTML = ''; // Clear previous forecast data

    const dailyForecasts = [];
    let daysCount = 0;  // Counter to limit to 5 days

    // Process the forecast data to get daily forecasts
    data.list.forEach(forecast => {
        const date = new Date(forecast.dt_txt);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });

        // Add forecast to the daily forecasts if it's a new day
        if (!dailyForecasts[day] && daysCount < 5) {
            dailyForecasts[day] = [];
            daysCount++;
        }

        if (dailyForecasts[day]) {
            dailyForecasts[day].push(forecast);
        }
    });

    Object.keys(dailyForecasts).forEach(day => {
        const forecasts = dailyForecasts[day];
        const iconCode = forecasts[0].weather[0].icon;
        const description = forecasts[0].weather[0].description;
        const tempMax = Math.max(...forecasts.map(f => f.main.temp_max));
        const tempMin = Math.min(...forecasts.map(f => f.main.temp_min));

        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';
        forecastDay.innerHTML = `
            <h5>${day}</h5>
            <img src="http://openweathermap.org/img/wn/${iconCode}.png" alt="Weather icon">
            <div class="temp-range">
                <div class="temp-max">H: ${Math.round(tempMax)}°C</div>
                <div class="temp-min">L: ${Math.round(tempMin)}°C</div>
            </div>
            <div class="description">${description}</div>
        `;

        forecastInfo.appendChild(forecastDay);
    });
}

function formatTime(cityTime) {
    const timeOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    return new Date(cityTime).toLocaleString('en-US', timeOptions);
}

function showBackButton() {
    const backButton = document.getElementById('back-button');
    backButton.classList.remove('d-none');
    backButton.addEventListener('click', function() {
        resetApplication();
    });
}

function resetApplication() {
    document.getElementById('weather-info').innerHTML = '';
    document.getElementById('forecast-info').innerHTML = '';
    document.getElementById('city-input').value = '';
    document.getElementById('back-button').classList.add('d-none');
    document.getElementById('background-image').src = 'images/default.jpg';
}

function clearCitySuggestions() {
    const datalist = document.getElementById('city-suggestions');
    datalist.innerHTML = '';
}
