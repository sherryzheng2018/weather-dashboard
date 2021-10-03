// save reference to important DOM elements
let timeDisplayEl = $('#current-day');
let weatherAPIKey = '1b8540a2a28db686f177dfbd5b8ac2ca';
let weatherAPIUrl = 'https://api.openweathermap.org/data/2.5/weather?units=imperial';
let onecallAPIUrl = 'https://api.openweathermap.org/data/2.5/onecall?units=imperial';

//populate the old history list 
var previousSearchedCities = JSON.parse(localStorage.getItem("historyList")) || [];


// handle displaying the time
function displayDate() {
  var rightNow = moment().format('M/DD/YYYY [at] hh:mm a');
  timeDisplayEl.text(rightNow);
}

function weatherForecast(cityName){
  let cityWeatherUrl = weatherAPIUrl + "&appid=" + weatherAPIKey + "&q=" + cityName;
  fetch(cityWeatherUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
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
          printCurrentWeather(cityName, data.current.temp, data.current.wind_speed, data.current.humidity, data.current.uvi);
          $('#forecastCards .singleCard').each(function (index) {
            console.log(index)
            $(this).children('h5').text(moment().add(index + 1, 'days').format('M/DD/YYYY'))
            $(this).children('icon').text(data.daily[index].weather[0].main);
            $(this).first().children('p.forcastTemp').children().first().text(data.daily[index].temp.day + " F")
            $(this).first().children('p.forcastWind').children().first().text(data.daily[index].wind_speed + " MPH")
            $(this).first().children('p.forcastHum').children().first().text(data.daily[index].humidity + " %")
          })
        })
    })
 

}
// function search() {
//     console.log("clicked");
// }
// $('#searchBtn').click(search);

//add click function to search btn
$('#searchFrom').submit(function (e) {
  e.preventDefault();
  //   console.log($('#searchInput').val());
  let cityName = $('#searchInput').val();
  weatherForecast(cityName); 
  
  $('#searchInput').val("");
  console.log("Local storage", previousSearchedCities)

  //append my new city to the previous list 
  previousSearchedCities.push(cityName);

  //Save it into Local Storage as a searchHistoryList 
  localStorage.setItem("historyList", JSON.stringify(previousSearchedCities));
  //refresh the search history list 
  printsearchedCities(); 
});

function printCurrentWeather(city, temp, wind, humidity, uvi) {
  $('#current h2').text(city);
  $('#currentTemp').text(temp + " F");
  $('#currentWind').text(wind + " MPH");
  $('#currentHum').text(humidity + " %");
  $('#currentUV').text(uvi); // need to add color indicator

}
displayDate();
printsearchedCities();

function printsearchedCities() {
  var searchListElement = $('#searchHistory');
  //reset the container 
  searchListElement.empty(); 

  //for loop attached to the html page 
  // 1- variable starts at 0; condition ; thirdpart - ++ 
  var maxlimit = 8 ; 
  if( previousSearchedCities.length <8){
    maxlimit = previousSearchedCities.length - 1;
  }
  for (i = 0; i <= maxlimit ; i++) {
    var searchCity = previousSearchedCities[i];
    //Create a button 
    var newBtn = document.createElement("button"); 
    //setting display text for the button 
    newBtn.textContent =  previousSearchedCities[i]; 
    console.log("New Button", newBtn)
    //add eventlistiner  listiner for the button 
    newBtn.onclick = weatherForecast; 
    //append the button to the div 
    searchListElement.append(newBtn)
  }

}



// To fix:
// 1. duplicated city name 
// 2. no onclick event added
// 3. add icon to current city name &icon to predict city card
// 4. add clear history button event
// 5. UV and color index