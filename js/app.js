let current_time = new Date();
const min =
  current_time.getMinutes() < 10 ?
  `0${current_time.getMinutes()}` :
  current_time.getMinutes();

class htmlTemp {
  constructor(options) {
    this.card = `<div class="weather-card flex-container">
        <span class="weather__day" data-day='${new Date(
          options.day * 1000
        ).getDate()}'>
          ${dataObject.days[new Date(options.day * 1000).getDay()]}, </br> ${
      dataObject.months[new Date(options.day * 1000).getMonth()]
    }, ${new Date(options.day * 1000).getDate()}
        </span>
        <img
          src="${options.icon}"
          alt="#"
          class="weather__icon"
        />
        <div class="weather__deg">
          ${options.temp}
        </div>
      </div>`;

    this.main = `<div class="current flex-container">
        <div class="current__deg">${options.temp}
        </div>
         <div class="inner-container flex-container">
             <div class="current__city">${options.cityName}</div>
             <div class="current__date">${
               dataObject.days[current_time.getDay()]
             }, ${
      dataObject.months[current_time.getMonth()]
    }, ${current_time.getDate()}, ${current_time.getHours()}:${min} </div>
             <img src="${
               dataObject.icons[options.des]
             }" alt="#" class="current__icon"/>
             <div class="subtitle">${options.des}</div>
         </div>

         <div class="additional-info flex-container">
            
             <div class="humidity">${options.humidity}</div>
             <div class="wind">${options.wind} m/s</div>
         </div>
         </div>`;
  }
}

const dataObject = {
  icons: {
    "clear sky": "./img/icons/sun.png",
    "light rain": "./img/icons/light-rain.png",
    "few clouds": "./img/icons/cloud.png",
    "overcast clouds": "./img/icons/some-cloud.png",
    "scattered clouds": "./img/icons/few-clouds.png",
    "broken clouds": "./img/icons/cloud.png",
    "moderate rain": "./img/icons/light-rain.png",
    "heavy intensity rain": "./img/icons/storm.png",
  },
  months: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  days: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
};

const getDOM = (selector) => document.querySelector(selector);
const getDOMall = (selector) => document.querySelectorAll(selector);

// function check out where user input city name and return string to request
const requestCity = () => {
  let lookCity = getDOM(".input__loc").value;
  let select = getDOM("select");
  let city;

  if (lookCity) {
    city = lookCity;
    getDOM(".input__loc").value = "";
  } else {
    city = select.value;
  }
  return `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=485ca2d7e2f468ad9254657c0b61579b`;
};

// if the user changes the choice, we send a request to get the city name
getDOM("select").onchange = () => sendRequest("GET", requestCity());

// if the user input city, we send a request to get the city name
getDOM(".input__loc").onchange = () => sendRequest("GET", requestCity());

class Forecast {
  constructor(options) {
    this.name = options.cityName;
    this.day = options.day;
    this.icon = options.icon;
    this.des = options.des;
    this.tempMax = options.tempMax;
    this.tempMin = options.tempMin;
    this.wind = options.wind;
    this.humidity = options.humidity;
  }
}

const sendRequest = (method, url, body = null) => {
  fetch(url)
    .then((resp) => resp.json()) // convert response to json format
    .then((data) => {

      if (data.message) {
        getDOM(".render").innerHTML = `<div class="current">
              <h1>${data.message.toUpperCase()}</h1>
            </div>`;
        getDOM(".group-cards").innerHTML = "";
      }

      // console.log(data.city.timezone / 60 / 60);

      let forecastDays = []; //empty array

      for (let i = 0; i < data.list.length; i += 8) {
        const temp = new Forecast({
          cityName: data.city.name,
          day: data.list[i].dt,
          icon: dataObject.icons[data.list[i].weather[0]["description"]], // get icons from dataObject component
          des: data.list[i].weather[0]["description"],
          tempMax: `${Math.round(data.list[i].main.temp_max - 273.15)}&deg;C`,
          tempMin: `${Math.round(data.list[i].main.temp_min - 273.15)}&deg;C`,
          wind: `${data.list[i].wind.speed}`,
          humidity: `${data.list[i].main.humidity}% humidity`,
        });
        forecastDays.push(temp);

      }

      getDOM(".group-cards").innerHTML = "";
      for (let key in forecastDays) {
        const weatherCard = new htmlTemp({
          cityName: forecastDays[key].name,
          day: forecastDays[key].day,
          icon: forecastDays[key].icon,
          des: forecastDays[key].des,
          temp: forecastDays[key].tempMax,
        });

        getDOM(".group-cards").innerHTML += weatherCard.card;
        // getDOM(".group-cards").style.display = "none";
      }
      for (let item of getDOMall(".controls__item")) {
        item.onclick = (e) => {
          if (e.target.dataset.day == "five") {
            getDOM(".group-cards").style.display = "flex"
          } else {
            setTimeout(() => {
              getDOM(".group-cards").style.display = "none";
            }, 300);
          }
        };
      }

      const weatherMain = new htmlTemp({
        cityName: forecastDays[0].name,
        day: forecastDays[0].day,
        icon: forecastDays[0].icon,
        des: forecastDays[0].des,
        temp: forecastDays[0].tempMax,
        humidity: forecastDays[0].humidity,
        wind: forecastDays[0].wind,
      });
      getDOM(".render").innerHTML = weatherMain.main;
    })
    .catch((e) => console.log(e)); //catch any errors)
};
sendRequest("GET", requestCity());
