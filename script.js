// save reference to important DOM elements
let timeDisplayEl = $('#current-day');
let weatherAPIKey = '1b8540a2a28db686f177dfbd5b8ac2ca';
let weatherAPIUrl = 'https://api.openweathermap.org/data/2.5/weather?units=imperial';
let onecallAPIUrl = 'https://api.openweathermap.org/data/2.5/onecall?units=imperial';
var searchListElement = $('#searchHistory');
//populate the old history list 
var previousSearchedCities = JSON.parse(localStorage.getItem("historyList"))  || [];


// handle displaying the time
function displayDate() {
  var rightNow = moment().format('M/DD/YYYY');
  timeDisplayEl.text('(' + rightNow + ')');
}

function weatherForecast(cityName){
  let cityWeatherUrl = weatherAPIUrl + "&appid=" + weatherAPIKey + "&q=" + cityName;
  fetch(cityWeatherUrl)
    .then(function (response) {
        //handing error here won't prevent the data function to be called
        //because api return 404 is still a valid response 
        //reference: https://stackoverflow.com/questions/39297345/fetch-resolves-even-if-404
      return response.json();
    })
    .then(function (data) {
      //check if coordinate exists from api response
      if(data.coord !== undefined){
      //   console.log(data.coord.lat)
      //   console.log(data.coord.lon)
      let onecallUrl = onecallAPIUrl + "&appid=" + weatherAPIKey + "&lat=" + data.coord.lat + "&lon=" + data.coord.lon
      //   console.log(onecallUrl)
      fetch(onecallUrl)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          // console.log(data)
          // console.log(data.daily[0].weather[0].main) // {id: 804, main: 'Clouds', description: 'overcast clouds', icon: '04d'}
          // console.log(data.daily[0].temp.day)
          // console.log(data.daily[0].wind_speed)
          // console.log(data.daily[0].humidity)
          printCurrentWeather(cityName, data.current.temp, data.current.wind_speed, data.current.humidity, data.current.uvi, data.current.weather[0].icon);
          console.log(data);
          $('#forecastCards .singleCard').each(function (index) {
            console.log(index)
            $(this).children('h5').text(moment().add(index + 1, 'days').format('M/DD/YYYY'))
            $(this).children('img').text(data.daily[index].weather[0].main);
            $(this).children('img').attr("src", getIconUrl(data.daily[index].weather[0].icon));
            $(this).first().children('p.forcastTemp').children().first().text(data.daily[index].temp.day + " F")
            $(this).first().children('p.forcastWind').children().first().text(data.daily[index].wind_speed + " MPH")
            $(this).first().children('p.forcastHum').children().first().text(data.daily[index].humidity + " %")
          }) 
        })
      } else { //if (data.coord !== undefined){
        $('#weatherContent').addClass('hide');
        //find the index of incorrect city name
        let index = previousSearchedCities.indexOf(cityName);
        if (index > -1) {
          //remove city name from search history
          previousSearchedCities.splice(index, 1);
        }
        //remove city name from localStorage
        localStorage.setItem("historyList", JSON.stringify(previousSearchedCities));
        printsearchedCities();
        alert("City not found, please try again...");
      }
    })
 

}

//add click function to search btn
$('#searchFrom').submit(function (e) {
  e.preventDefault();
  //   console.log($('#searchInput').val());
  let currentCity = $('#searchInput').val();
  weatherForecast(currentCity); 
  $('#weatherContent').removeClass('hide');
  $('#searchInput').val("");
  console.log("Local storage", previousSearchedCities)

  //append my new city to the previous list, with max 8 city in the list
  if (!previousSearchedCities.includes(currentCity)) {
    if (previousSearchedCities.length < 8) {
      previousSearchedCities.push(currentCity);
    } else {
      for (i = 0; i <= 7; i++) {
        previousSearchedCities[i] = previousSearchedCities[i+1];
      }
      previousSearchedCities[7] = currentCity;
    }
  } 

  //Save it into Local Storage as a searchHistoryList 
  localStorage.setItem("historyList", JSON.stringify(previousSearchedCities));
  //refresh the search history list 
  printsearchedCities(); 
});

function printCurrentWeather(city, temp, wind, humidity, uvi, iconId) {
  $('#current h2').text(city);
  $('#currentTemp').text(temp + " F");
  $('#currentWind').text(wind + " MPH");
  $('#currentHum').text(humidity + " %");
  var uvEl = $('#curUvValue');
  uvEl.text(uvi); // need to add color indicator
  $('#currentTitle img').attr("src", getIconUrl(iconId));
  uvEl.removeClass();
    if(uvi < 3 ) {
      uvEl.addClass('green')
    } else if(uvi >=3 && uvi <6) {
      uvEl.addClass('yellow')
    } else if(uvi >=6 && uvi <8) {
      uvEl.addClass('orange')
    } else if(uvi >=8 && uvi <11) {
      uvEl.addClass('red')
    } else {
      uvEl.addClass('purple')
    }

}

function searchFromHistory(e){
  weatherForecast(e.target.firstChild.data);
  $('#weatherContent').removeClass('hide');
}

function printsearchedCities() {
  //reset the container 
  searchListElement.empty(); 

  //for loop attached to the html page 
  // 1- variable starts at 0; condition ; thirdpart - ++ 
  for (i = previousSearchedCities.length - 1; i >= 0 ; i--) {
    //Create a button 
    var newBtn = $("<button>"); 
    newBtn.addClass("history-btn");
    //setting display text for the button 
    newBtn.text(previousSearchedCities[i]); 
    console.log("New Button", newBtn)
    //add eventlistiner  listiner for the button 
    newBtn.click(searchFromHistory); 
    //append the button to the div 
    searchListElement.append(newBtn)
  }

}

function getIconUrl(iconId) {
  return "https://openweathermap.org/img/wn/" + iconId + "@2x.png";
}

function clearSearchHistory() {
  previousSearchedCities = [];
  searchListElement.text("");
  localStorage.setItem("historyList", JSON.stringify([]));
}

$('#clearBtn').click(clearSearchHistory);
displayDate();
printsearchedCities();
