 $(function(){


	var $cityInput = $(".form-group").find("#cityInput");
	var $countryInput = $(".form-group").find("#countryInput");
	var $submitButton = $(".form-group").find("#submitButton");
	var $measureUnitsButton = $(".form-group").find("#measureUnits");
	var $moreResultsButton =$(".weatherForecast").find("#moreResultsButton");

	// divs that are used to store forecast results from API requests
	var $forecastResults = $("#forecastResults").find("#resultsList");
	var $currentWeather = $("#currentWeatherDiv").find("#currentWeather");

	var celsiusSymbol = "&deg;C";
	var forecastLayout = "col-md-3 col-sm-4 col-xs-6 forecastItem";

	// number of items that will be returned for forecasts;
	var shortTermForecastItems = 8, longTermForecastItems = 20;

	// on load, app shows current weather in the random city
	var randomLocations = [["UK", "London"], ["Germany", "Berlin"], ["Lithuania", "Vilnius"], ["USA", "NewYork"], ["Hong Kong", "Hong Kong"],
		["Brazil", "Rio"], ["Japan", "Tokyo"], ["Morocco", "Casablanca"], ["Russia", "Murmansk"], ["Russia", "Moscow" ]];

	var randomLocation = randomLocations[Math.floor(Math.random() * randomLocations.length)];

	var currentURL = "https://api.wunderground.com/api/76b97200a9d4460e/conditions/q/";
	var forecastURL = "https://api.wunderground.com/api/76b97200a9d4460e/conditions/forecast/forecast10day/q/";
	
	// objects for storing information from API requests
	var currentWeather = {}, shortTermForecast = {}, longTermForecast = {};

	var storeCurrentWeatherData = function(data){
		currentWeather.name = data["current_observation"]["display_location"]["full"];
		currentWeather.tempCel = Math.round(data["current_observation"]["temp_c"]);
		currentWeather.weather = data["current_observation"]["weather"];
		currentWeather.icon = "https" + data["current_observation"]["icon_url"].slice(4);	
	};

	var storeForecastData = function(data){
		shortTermForecast.name = data["current_observation"]["display_location"]["city"];
		shortTermForecast.dayName = data["forecast"]["txt_forecast"]["forecastday"];
		shortTermForecast.resultsBase = data["forecast"]["simpleforecast"]["forecastday"];
	};

	var storeLongTermData = function(data){
		longTermForecast.dayName = data["forecast"]["txt_forecast"]["forecastday"];
		longTermForecast.weather = data["forecast"]["simpleforecast"];
	};
	

	// initializes API request for a random city
	$.ajax({

			url: currentURL + randomLocation[0] + "/" + randomLocation[1] + ".json",
			dataType: "jsonp",
			success: function(result){

				$currentWeather.empty();
				storeCurrentWeatherData(result);
		
				$currentWeather.html(
					"<h3>" + currentWeather.name + "</h3>"
					+ currentWeather.tempCel  + " " + celsiusSymbol  
					+ "<br /><img src='" + currentWeather.icon + "'> <br />" 
					+ currentWeather.weather
					);	
			},
			error: function(){
				$currentWeather.html(
					"<p>Failed to load current weather in a random location.</p>"
					);
			}
	});

	
	$submitButton.on("click", function(){

		var city = $cityInput.val().replace(" ", "");
		var country = $countryInput.val().replace(" ", ""); 

		// if no city name is provided, user will be notified by changing input's field border colour
		if (city.length === 0){
			$cityInput.css("border-color", "red");
		}	else {
			$cityInput.css("border-color", "#7A7D8E");
		}


		$.ajax({
			url: forecastURL + country + "/" + city + ".json",
			dataType: "jsonp",
			success: function(result){
				
				$moreResultsButton.removeClass("hidden");
				// prevents footer from obstructing moreResultsButton
				$("#footer").removeClass("navbar-fixed-bottom");

				$forecastResults.empty();
				$("#forecastText").empty();
				$currentWeather.empty();

				storeCurrentWeatherData(result);
				storeForecastData(result);
				storeLongTermData(result);
				
				$currentWeather.html(
					"<h3>" + currentWeather.name + "</h3>"
					+ currentWeather.tempCel  + " " + celsiusSymbol 
					+ "<br /><img src='" + currentWeather.icon + "'> <br />" 
					+ currentWeather.weather
				);

				// shows short term forecast
				for ( var i = 0; i < shortTermForecastItems; i++ ){

					var httpsIconUrl = "https" + shortTermForecast.resultsBase[i]["icon_url"].slice(4);

					$forecastResults.append(
						"<li class='" + forecastLayout + "'><strong>" 	
						+ shortTermForecast.name + "</strong><br />" 
						+ shortTermForecast.dayName[i]["title"]
						+ "<br /><img src='" + httpsIconUrl + "'>"
						+ "<br />High:"  + shortTermForecast.resultsBase[i]["high"]["celsius"] + celsiusSymbol 
						+ "<br />Low:" + shortTermForecast.resultsBase[i]["low"]["celsius"] + celsiusSymbol + "</li>" 
					);
				}
			}, 
			error: function(){
				$("#forecastText").empty();
				$forecastResults.html("<p>Forecast failed to gather weather forecast. Please check your spelling and try again.</p>");
				$currentWeather.html( "<p>Failed to load current weather in provided location. Please check if the city name was correct.</p>");	
			}
		});
	});


	$cityInput.keypress(function(event){
		if (event.keyCode === 13){
			$submitButton.click();
		}
	});


	$countryInput.keypress(function(event){
		if (event.keyCode === 13){
			$submitButton.click();
		}
	});

	
	$moreResultsButton.on("click", function(){

		// regex for a sentence that contains temperature forecast data
		var re = /\d+C/;

		$forecastResults.empty();
		$(this).addClass("hidden");

		// variables used for displaying long term forecast results 
		var temperatureArray = "", temperatureSentence = "", temperature = "", httpsIconUrl = "";
 
		for ( var i = 0; i < longTermForecastItems; i++ ){

			// splits description into separate sentences
			temperatureArray = longTermForecast.dayName[i]["fcttext_metric"].split(".");

			function containsTemperature(value){
				  if (re.test(value)){
				  	return value;
				  }
			};

			temperatureSentence = temperatureArray.filter(containsTemperature);
			
			temperature = temperatureSentence.toString().substring(0, temperatureSentence.toString().length - 1);

			httpsIconUrl = "https" + longTermForecast.dayName[i]["icon_url"].slice(4);

			$forecastResults.append(
				"<li class='" + forecastLayout + "'><strong>" 
				+ shortTermForecast.name + "</strong><br />" 
				+ longTermForecast.dayName[i]["title"] 
				+ "<br /><img src='" + longTermForecast.dayName[i]["icon_url"] + "'><br />"
				+ temperature + celsiusSymbol + "</li>"
				);
		}
	});
});