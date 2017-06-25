var express = require('express');
var app = express();
var url = require('url');
var path = require('path');

app.set('port', (process.env.PORT || 5000));

//app.use(express.static(__dirname + '/public'));

app.use(express.static(path.join(__dirname + '/public')));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/getRate', function(request, response) {
	handleMath(request, response);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function handleMath(request, response) {
	var requestUrl = url.parse(request.url, true);

	console.log("Query parameters: " + JSON.stringify(requestUrl.query));

	// TODO: Here we should check to make sure we have all the correct parameters

	var letter = requestUrl.query.letter;
	var weight = Number(requestUrl.query.weight);

	console.log("This also works");

	computeOperation(response, letter, weight);
}

function computeOperation(response, letter, weight) {
	//letter = letter.toLowerCase();

	var result = 0;
	var original = weight;

	if ((letter == "Stamped Letter" || letter == "Metered Letter") && weight <= 3.5 && weight > 3) {
		console.log("it is a special stamped or metered");
	} else {
		weight = Math.ceil(weight);
		console.log("the weight is now " + weight);
	}

	if (letter == "Stamped Letter" && (weight <= 3.5 && weight > 3)) {
		result = 1.12;
		console.log("it is 3.5 stamped");
	} else if (letter == "Metered Letter" && (weight <= 3.5 && weight > 3)) {
		result = 1.09;
		console.log("it is 3.5 metered");
	} else if (letter == "Stamped Letter") {
		result = .28 + weight * .21;
		console.log("it is stamped");
	} else if (letter == "Metered Letter") {
		result = .25 + weight * .21;
		console.log("it is metered");	
	} else if (letter == "Large Envelope") {
		result = .77 + weight * .21;
		console.log("it is large");
	} else if (letter == "Parcel") {
		if (weight < 5) {
			result = 2.67;
			console.log("it is less then 5");
		} else {
			result = 1.95 + weight * .18;
			console.log("it is greater then 5");
		}
	} else {
		// It would be best here to redirect to an "unknown operation"
		// error page or something similar.
	}
	result = result.toFixed(2);

	// Set up a JSON object of the values we want to pass along to the EJS result page
	var params = {letter: letter, original: original, result: result};

	// Render the response, using the EJS page "result.ejs" in the pages directory
	// Makes sure to pass it the parameters we need.
	response.render('pages/result', params);

}