let appLang = "en";
let units = "metric";

const trans = (key) => {
  const translations = getDictionary(appLang);
  return translations[key];
};

const tzDate = (timezoneOffset = 0) => {
  let d = new Date();
  return new Date(
    d.getTime() + d.getTimezoneOffset() * 60000 + timezoneOffset * 1000
  );
};

class AppMap {
  constructor(defaultLat = 0, defaultLon = 0) {
    this.map = new google.maps.Map(document.getElementById("map"), {
      zoom: 8,
      center: {
        lat: defaultLat,
        lng: defaultLon,
      },
    });
  }

  setCenter = (center) => this.map.setCenter(center);

  updateCoordinatesDescription = (lat, lon) => {
    lat = lat.toString();
    lon = lon.toString();

    const latValue = document.querySelector(".lat-value");
    const lonValue = document.querySelector(".lon-value");
    const [lonDeg, lonMin] = lon.split(".");
    const [latDeg, latMin] = lat.split(".");

    latValue.innerHTML = `${latDeg}°${latMin.slice(0, 2)}'`;
    lonValue.innerHTML = `${lonDeg}°${lonMin.slice(0, 2)}'`;
  };
}

class Weather {
  updateCurrentWeather = (data) => {
    const degree = document.querySelector(".degree");
    const currentWeatherIcon = document.querySelector(".icon");
    const weatherDescription = document.querySelector(".weather-description");
    const feelsLikeValue = document.querySelector(".feels-like-value");
    const wind = document.querySelector(".wind-value");
    const humidity = document.querySelector(".humidity-value");

    degree.innerHTML = `${Math.round(data.temp)}`;
    currentWeatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherDescription.innerHTML = data.weather[0].description.toUpperCase();
    feelsLikeValue.innerHTML = `${Math.round(data.feels_like)}°`;
    wind.innerHTML = `${data.wind_speed} m/s`;
    humidity.innerHTML = `${data.humidity}%`;
  };

  updateForecastDays = () => {
    const date = new Date();
    let forecastFirstDay = document.querySelector(".forecast-day-1");
    let forecastSecondDay = document.querySelector(".forecast-day-2");
    let forecastThirdDay = document.querySelector(".forecast-day-3");

    let forecastDayOne = (date.getDay() + 1) % 7;
    let forecastDayTwo = (date.getDay() + 2) % 7;
    let forecastDayThree = (date.getDay() + 3) % 7;

    forecastFirstDay.innerHTML = trans(dayNames[forecastDayOne]);
    forecastFirstDay.dataset["i18n"] = dayNames[forecastDayOne];

    forecastSecondDay.innerHTML = trans(dayNames[forecastDayTwo]);
    forecastSecondDay.dataset["i18n"] = dayNames[forecastDayTwo];

    forecastThirdDay.innerHTML = trans(dayNames[forecastDayThree]);
    forecastThirdDay.dataset["i18n"] = dayNames[forecastDayThree];
  };

  updateForecast = (data) => {
    this.updateForecastDays();

    const forecastDegreeFirst = document.querySelector(
      ".day-1 .forecast-degree"
    );
    const forecastDegreeSecond = document.querySelector(
      ".day-2 .forecast-degree"
    );
    const forecastDegreeThird = document.querySelector(
      ".day-3 .forecast-degree"
    );
    const forecastIconFirst = document.querySelector(".day-1 .forecast-icon");
    const forecastIconSecond = document.querySelector(".day-2 .forecast-icon");
    const forecastIconThird = document.querySelector(".day-3 .forecast-icon");

    forecastDegreeFirst.innerHTML = `${Math.round(data.daily[1].temp.day)}°`;
    forecastDegreeSecond.innerHTML = `${Math.round(data.daily[2].temp.day)}°`;
    forecastDegreeThird.innerHTML = `${Math.round(data.daily[3].temp.day)}°`;

    forecastIconFirst.src = `http://openweathermap.org/img/wn/${data.daily[1].weather[0].icon}@2x.png`;
    forecastIconSecond.src = `http://openweathermap.org/img/wn/${data.daily[2].weather[0].icon}@2x.png`;
    forecastIconThird.src = `http://openweathermap.org/img/wn/${data.daily[3].weather[0].icon}@2x.png`;
  };

  fetchWeather = (lat, lon) => {
    fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${units}&lang=${appLang}&&exclude=minutely,hourly,alerts&appid=07c55933f353d95f3c9f3d56aede6c6b`
    )
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        this.updateCurrentWeather(data.current);
        this.updateForecast(data);
      });
  };
}

class App {
  constructor() {
    this.location = {
      lat: 0,
      lon: 0,
    };
    this.lang = null;
    this.units = null;
    this.timezoneOffsetSeconds = new Date().getTimezoneOffset() * -60;

    this.map = new AppMap(this.location.lat, this.location.lon);
    this.weather = new Weather();
  }

  setLocation = (lat, lon) => {
    this.location.lat = lat;
    this.location.lon = lon;

    this.map.setCenter({ lat: this.location.lat, lng: this.location.lon });
    this.map.updateCoordinatesDescription(lat, lon);

    this.weather.fetchWeather(this.location.lat, this.location.lon);
    this.updateCurrentLocation(this.location.lat, this.location.lon);
  };

  getCurrentTime = () => {
    const date = tzDate(this.timezoneOffsetSeconds);
    const minutes = date.getMinutes();
    const hours = date.getHours();
    const seconds = date.getSeconds();
    const day = date.getDay();
    const currentDate = date.getDate();
    const month = date.getMonth();

    const time = document.querySelector(".time");
    time.innerHTML = `${trans(shortDayNames[day])} ${currentDate} ${trans(
      monthNames[month]
    )} ${hours < 10 ? `0${hours}` : hours}:${
      minutes < 10 ? `0${minutes}` : minutes
    }:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  changeBackground = () => {
    fetch(
      "https://api.unsplash.com/photos/random?orientation=landscape&per_page=1&query=nature&client_id=YPcf-iCukl1ce8b8kEe645lUD57BYBXO0NcOwderTmY"
    )
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        const backgroundWrapper = document.querySelector("body");
        let bgImage = data.urls.regular;
        localStorage.setItem("bg", bgImage);
        backgroundWrapper.style.backgroundImage = `linear-gradient(
          45deg,
          rgba(8, 15, 26, 0.59),
          rgba(17, 17, 46, 0.46)
        ), url(${data.urls.regular})`;
        backgroundWrapper.style.backgroundSize = "100% 100%";
      });
  };

  translatePage = () => {
    const elementsToTranslate = document.querySelectorAll("[data-i18n]");
    const placeholderElements = document.querySelectorAll(
      "[data-placeholder-i18n]"
    );

    const dict = getDictionary(appLang);
    elementsToTranslate.forEach((element) => {
      element.textContent = dict[element.dataset.i18n];
    });
    placeholderElements.forEach((element) => {
      element.placeholder = dict[element.dataset.placeholderI18n];
    });
  };

  changeUnits = (unitValue) => {
    units = unitValue;
    this.weather.fetchWeather(this.location.lat, this.location.lon);
  };

  getCurrentPosition = () => {
    const successCallback = (position) => {
      this.setLocation(position.coords.latitude, position.coords.longitude);
    };

    const rejectCallback = () => {
      fetch("https://ipinfo.io/json?token=191f588ffe1237")
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          const [lat, lon] = data.loc.split(",");
          this.setLocation(parseFloat(lat), parseFloat(lon));
        });
    };

    navigator.geolocation.getCurrentPosition(successCallback, rejectCallback);
  };

  initSearch = () => {
    const placesAutocomplete = places({
      apiKey: "c03593e90476e82957845e092b34f1fa",
      container: document.querySelector("#address-input"),
      templates: {
        value: function (suggestion) {
          return suggestion.name;
        },
      },
    }).configure({
      type: "city",
      aroundLatLngViaIP: false,
    });

    placesAutocomplete.on("change", (event) =>
      this.setLocation(event.suggestion.latlng.lat, event.suggestion.latlng.lng)
    );
  };

  updateCurrentLocation = (lat, lon) => {
    fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=78bd0ae1b89546c2a3434ed3b33b4a2e&language=${appLang}`
    )
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        this.timezoneOffsetSeconds =
          data.results[0].annotations.timezone.offset_sec;
        const userLocation = document.querySelector(".location-text");
        userLocation.textContent = `${data.results[0].components.city}, ${data.results[0].components.country}`;
      });
  };

  changeLanguage = (lang) => {
    appLang = lang;
    this.translatePage();
    this.weather.fetchWeather(this.location.lat, this.location.lon);
    this.updateCurrentLocation(this.location.lat, this.location.lon);
  };

  start = () => {
    this.changeBackground();
    this.getCurrentPosition();
    this.weather.fetchWeather(this.location.lat, this.location.lon);
    this.initSearch();

    setInterval(this.getCurrentTime, 1000);

    const bgRefreshBtn = document.querySelector(".refresh-btn");
    bgRefreshBtn.addEventListener("click", () => this.changeBackground());

    const langButton = document.querySelector(".language-select");
    langButton.addEventListener("change", (ev) =>
      this.changeLanguage(ev.target.value)
    );

    const fahrenheitBtn = document.querySelector(".fahrenheit-btn");
    const celsiusBtn = document.querySelector(".celsius-btn");
    fahrenheitBtn.addEventListener("click", () => {
      this.changeUnits("imperial");
      fahrenheitBtn.classList.toggle("active-btn");
      celsiusBtn.classList.toggle("active-btn");
    });
    celsiusBtn.addEventListener("click", () => {
      this.changeUnits("metric");
      fahrenheitBtn.classList.toggle("active-btn");
      celsiusBtn.classList.toggle("active-btn");
    });
  };
}

const app = new App();
app.start();
