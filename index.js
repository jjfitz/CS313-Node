var express = require('express');
var app = express();
var pg = require('pg');
var bodyParser = require('body-parser');
var session = require('express-session')

var {Pool} = require('pg') // that gets the Pool attribute from the full pg module

//Pool.defaults.ssl = true;


var gmaps = require('@google/maps').createClient({
  key: 'my key'
});

if (process.env.DATABASE_URL != '')
{
  var connectionString = process.env.DATABASE_URL;
} else {
var connectionString = 'postgres://postgres@localhost/gonning';
//}

const pool = new Pool({connectionString});

/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */
app.use(bodyParser.urlencoded({
    extended: true
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());


app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.post('/checkUser', function(request, response){
  handleRequest(request, response);
});

function handleRequest(request, response) {
console.log(request.body.username);
  const username = request.body.username;
  pool.query('SELECT * FROM "users" WHERE user_name = $1', [username], (err, res) => {
    if (err) {
      throw err
    } else {
      console.log(res);
      //response.json(res.rows[0]);
      var user = res.rows[0];
      console.log(user);
      showGoals(response, user);
    }
  })
}

function showGoals(response, user) {
  pool.query('SELECT * FROM "goals" WHERE user_id = $1', [user.id], (err, res) => {
    if (err) {
      throw err
    } else {
      console.log(res);
      var goals = [];
      //response.json(res.rows[0]);
      for (i = 0; i < res.rows.length; i++) {
        console.log(res.rows[i]);
        goals.push(res.rows[i]);
        console.log(goals[i]);
      } 
      //var goals[0] = res.rows[0];
      var params = {user: user, goals: goals};
      response.render('pages/goals', params);
    }
  })
  //var params = {user: user, goals: goals};
  //response.render('pages/goals', params);
}

app.get('/goals', function(request, response){
  const id = request.query.id;
  pool.query('SELECT * FROM "goals" WHERE id = $1', [id], (err, res) => {
    if (err) {
      throw err
    } else {
      console.log(res);
      response.json(res.rows[0]);
    }
  })
  
});

app.get('/map', function(request, response){
  var place = 'rexburg walmart';//'1600 Amphitheatre Parkway, Mountain View, CA';
  gmaps.geocode({
  address: place
}, function(err, response) {
  if (!err) {
    console.log("This works");
    console.log(response.json.results);
    //response.json.gmaps;
    res.writeHead(200, {"Content-Type": "application/json"});
    res.write('{ "name":"Jason Fitzgerald","class":"cs313" }');
    console.log("This works");
  }
});
});


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});