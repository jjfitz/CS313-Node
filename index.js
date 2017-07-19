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

app.use(session({
  secret: 'Achiever',
  resave: false,
  saveUninitialized: true
}))

if (process.env.DATABASE_URL != '')
{
  var connectionString = process.env.DATABASE_URL;
} 
// else {
// var connectionString = 'postgres://postgres@localhost/gonning';
// }

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
  console.log('USING POST METHOD');
  handleRequest(request, response);
});

//for clicking on it
app.get('/checkUser', function(request, response){
  console.log('USING GET METHOD');
  handleRequest(request, response);
});

app.get('/create', function(request, response){
  console.log('USING GET METHOD for create');
  response.render('pages/create-goal');
});

function handleRequest(request, response) {

if (request.body.username != null && request.body.password != null) {
  request.session.user = request.body.username;
  request.session.pass = request.body.password;
  console.log(request.body.username, request.body.password);
  console.log(request.session.user, request.session.pass);
} 
if (request.session.user != "" && request.session.pass != "") {
const pass = request.session.pass;
const username = request.session.user;
  pool.query('SELECT * FROM "users" WHERE user_name = $1 and password = $2', [username, pass], (err, res) => {
    if (err) {
      console.log("User does not exist");
      request.session.destroy();
      throw err;
    } else {
      if (res.rows[0].user_name != username || res.rows[0].password != pass) {
      request.session.destroy();
      response.render('pages/index');
    } 
      var user = res.rows[0];
      request.session.uid = res.rows[0].id;
      console.log("Is this the right id? " + request.session.uid);
      console.log(user);
      showGoals(response, user);
    }
  })
} else {
  response.render('pages/index');
}
}

function showGoals(response, user) {
  pool.query('SELECT * FROM "goals" WHERE user_id = $1', [user.id], (err, res) => {
    if (err) {
      throw err
    } else {
      var goals = [];
      for (i = 0; i < res.rows.length; i++) {
        goals.push(res.rows[i]);
      } 
      var params = {user: user, goals: goals};
      response.render('pages/goals', params);
    }
  })
}

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

//Insert Goals

app.post('/insertGoal', function(request, response){
  console.log('USING POST METHOD To Insert Goal');
  handleInsert(request, response);
});

function handleInsert(request, response) {

if (request.body.username != null && request.body.password != null) {
  request.session.user = request.body.username;
  request.session.pass = request.body.password;
  console.log(request.body.username, request.body.password);
  console.log(request.session.user, request.session.pass);
}
if (request.session.user != "" && request.session.pass != "") {
  const pass = request.session.pass;
  const username = request.session.user;
  const user_id = request.session.uid;
  const goalName = request.body.goal_name;
  const description = request.body.description;
  const category = request.body.goal_view;
  const endDate = request.body.end_date;
  const location = request.body.location;
  console.log(user_id, goalName, description, endDate, category, location);

    pool.query('INSERT INTO goals(user_id, goal_name, description, start_date, end_date, goal_count, total_count, category, location) VALUES($1, $2, $3, current_timestamp, $4, 0, 0, $5, $6)', 
    [user_id, goalName, description, endDate, category, location], (err, res) => {
      if (err) {
        console.log("did not insert goal");
        request.session.destroy();
        throw err;
      } else {
        response.render('pages/confirmation');
      }
    })
  }
}

//Logout
app.get('/logout', handleLogout);

function handleLogout(request, response) {

  // We should do better error checking here to make sure the parameters are present
  if (request.session.user) {
    console.log("destroying session");
    request.session.destroy();
    response.render('pages/index');
  }
}





























