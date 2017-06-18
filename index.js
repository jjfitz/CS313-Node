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

	if (letter == "Stamped Letter") {
		result = .28 + weight * .21;
	} else if (letter == "Metered Letter") {
		result = .25 + weight * .21;		
	} else if (letter == "Large Envelope") {
		result = .77 + weight * .21;
	} else if (letter == "Parcel") {
		if (weight < 5) {
			result = 2.67;
		} else {
			result = 1.95 + weight * .18;
		}
	} else {
		// It would be best here to redirect to an "unknown operation"
		// error page or something similar.
	}
	result = result.toFixed(2);

	// Set up a JSON object of the values we want to pass along to the EJS result page
	var params = {letter: letter, weight: weight, result: result};

	// Render the response, using the EJS page "result.ejs" in the pages directory
	// Makes sure to pass it the parameters we need.
	response.render('pages/result', params);

}